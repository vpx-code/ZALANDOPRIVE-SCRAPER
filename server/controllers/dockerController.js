const fs = require('fs');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const Watchlist = require('../models/Watchlist')
const brandController = require('./brandController');
const categoryController = require('./categoryController');

const sanitizeServiceName = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
};

const readSecret = (name) => {
  return fs.readFileSync(`/run/secrets/${name}`, 'utf8').trim();
};

const serviceExists = async (name) => {
  const services = await docker.listServices();
  return services.find(service => service.Spec.Name === name);
};

const encodeURL = async (watchlist) => {
  const multi_option_char = "%7C";
  let payload = [];

  if (watchlist.url) {
    console.log('URL already exists for this watchlist.');
    return watchlist.url;
  }

  let category = await categoryController.getCategory(watchlist.category, watchlist.gender);
  if (!category.response) {
    console.log('No matching category found.');
    return;
  }

  let categoryCriterion = "category_ids=";
  let categoryId = category.response.categoryId;
  if (categoryId) {
    categoryCriterion = categoryCriterion.concat(categoryId);
    payload.push(categoryCriterion);
  }

  let brandCriterion = "brand_codes=";
  let brands = watchlist.brands;
  if (brands) {
    let brandCodePromises = brands.map((b) => brandController.getBrandCode(b));
    const resolvedBrandCodes = await Promise.all(brandCodePromises);

    resolvedBrandCodes.forEach((code, i) => {
      brandCriterion = brandCriterion.concat(code);
      if (i < resolvedBrandCodes.length - 1) {
        brandCriterion = brandCriterion.concat(multi_option_char);
      }
    });
    payload.push(brandCriterion);
  }

  let sizeTagsCriterion = "sizes.";
  let sizeTag = category.response.filterName;
  let watchlistSizes = watchlist.sizes;

  if (sizeTag && watchlistSizes) {
    sizeTagsCriterion = sizeTagsCriterion.concat(sizeTag, "=");
    watchlistSizes.forEach((s, i) => {
      sizeTagsCriterion = sizeTagsCriterion.concat(s);
      if (i < watchlistSizes.length - 1) {
        sizeTagsCriterion = sizeTagsCriterion.concat(multi_option_char);
      }
    });
    payload.push(sizeTagsCriterion);
  }

  let encodedPayload = payload.join("&");
  let completeURL = `https://www.zalando-prive.es/api/phoenix/search/ccf/articles?${encodedPayload}&size=60&sort=availability_female&no_soldout=1`;
  console.log(completeURL);

  watchlist.url = completeURL;
  await watchlist.save();

  return completeURL;
};

exports.startAllHellasteeze = async () => {
  console.log("Attempting to create service...")
  try {
    const watchlists = await Watchlist.find();
    if (watchlists.length == 0) {
      console.log("No watchlists were found. No services were created.")
    }
    else {
      // Running CookieMonster first...
      await runCookieMonster()
      for (const watchlist of watchlists) {
        const payload = await encodeURL(watchlist);
        await runHellasteeze(watchlist.name, payload);
      }
      console.log('All services started successfully');
    }
  } catch (err) {
    console.error('Error starting services', err.message);
  }
};

const runHellasteeze = async (serviceName, payload) => {
  try {
    const environmentVariables = [
      `url=${payload}`,
      `MONGODB_URI=${readSecret('mongodb_uri')}`,
      //    `PROXY_URI=${readSecret('proxy_uri')}`,
    ];

    const sanitizedServiceName = sanitizeServiceName(`hellasteeze_${serviceName}`);
    console.log(`Sanitized name is: ${sanitizedServiceName}`);

    const existingService = await serviceExists(sanitizedServiceName);

    const serviceSpec = {
      Name: sanitizedServiceName,
      TaskTemplate: {
        ContainerSpec: {
          Image: 'zpscraper-hellasteeze',
          Mounts: [
            {
              Target: '/var/run/docker.sock',
              Source: '/var/run/docker.sock',
              Type: 'bind'
            }
          ],
          Env: environmentVariables,
        },
        RestartPolicy: {
          Condition: 'none',
        },
        Placement: {
          Constraints: ['node.role == manager'],
        },
      },
      Mode: {
        Replicated: {
          Replicas: 1,
        },
      },
      Networks: [{
        Target: 'zpscraper_network'
      }],
    };

    if (existingService) {
      console.log(`Service ${sanitizedServiceName} already exists, removing and recreating it.`);
      const service = docker.getService(existingService.ID);
      await service.remove();
    } else {
      console.log(`Service ${sanitizedServiceName} does not exist, creating it.`);
    }

    const newService = docker.createService(serviceSpec);

    // Ensure the service is deployed and running
    if (newService) {
      console.log(`Service ${sanitizedServiceName} created successfully.`);
      await new Promise(resolve => setTimeout(resolve, 2000))
      const inspectResult = await docker.getService(sanitizedServiceName).inspect();
      print("Checked if the service is created and running...")
      if (inspectResult && inspectResult.Spec) {
        console.log(`Service ${sanitizedServiceName} is now running.`);
      } else {
        console.log(`Service ${sanitizedServiceName} was created but is not running.`);
      }
    } else {
      console.error(`Failed to create service ${sanitizedServiceName}.`);
    }
  } catch (err) {
    console.error('Service was not created or restarted:', err.message);
  }
};

// TODO: Horrible. Intentar reutilizar!!

const runCookieMonster = async () => {
  try {
    const environmentVariables = [
      `MONGODB_URI=${readSecret('mongodb_uri')}`,
      `ZALANDO_EMAIL=${readSecret('zalando_email')}`,
      `ZALANDO_PASSWORD=${readSecret('zalando_password')}`
    ];

    const serviceName = "zpscraper-cookiemonster"

    const existingService = await serviceExists(serviceName);

    const serviceSpec = {
      Name: serviceName,
      TaskTemplate: {
        ContainerSpec: {
          Image: 'zpscraper-cookiemonster',
          Mounts: [
            {
              Target: '/var/run/docker.sock',
              Source: '/var/run/docker.sock',
              Type: 'bind'
            }
          ],
          Env: environmentVariables,
        },
        RestartPolicy: {
          Condition: 'none',
        },
        Placement: {
          Constraints: ['node.role == manager'],
        },
      },
      Mode: {
        Replicated: {
          Replicas: 1,
        },
      },
      Networks: [{
        Target: 'zpscraper_network'
      }],
    };

    if (existingService) {
      console.log(`Service ${serviceName} already exists, removing and recreating it.`);
      const service = docker.getService(existingService.ID);
      await service.remove();
    } else {
      console.log(`Service ${serviceName} does not exist, creating it.`);
    }

    const newService = docker.createService(serviceSpec);

    // Ensure the service is deployed and running
    if (newService) {
      console.log(`Service ${serviceName} created successfully.`);
      await new Promise(resolve => setTimeout(resolve, 2000))
      const inspectResult = await docker.getService(serviceName).inspect();
      print("Checked if the service is created and running...")
      if (inspectResult && inspectResult.Spec) {
        console.log(`Service ${serviceName} is now running.`);
      } else {
        console.log(`Service ${serviceName} was created but is not running.`);
      }
    } else {
      console.error(`Failed to create service ${serviceName}.`);
    }
  } catch (err) {
    console.error('Service was not created or restarted:', err.message);
  }
};
