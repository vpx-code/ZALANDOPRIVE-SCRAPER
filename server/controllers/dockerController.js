const fs = require('fs');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

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

exports.createOrUpdateService = async (serviceName, payload) => {
  try {
    const environmentVariables = [
      `url=${payload}`,
      `MONGODB_URI=${readSecret('mongodb_uri')}`,
      `PROXY_URI=${readSecret('proxy_uri')}`,
      `ZALANDO_EMAIL=${readSecret('zalando_email')}`,
      `ZALANDO_PASSWORD=${readSecret('zalando_password')}`
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

    const newService = await docker.createService(serviceSpec);

    // Ensure the service is deployed and running
    if (newService) {
      console.log(`Service ${sanitizedServiceName} created successfully.`);
      const inspectResult = await docker.getService(sanitizedServiceName).inspect();
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