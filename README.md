# Zalando Scraper

In the spring of 2024, my then salesman colleague "sold" me an OrangePi: a Chinese Raspberry Pi clone for a third of the price. After he spent two weeks showing off his Home Assistant setup, I decided it was time to get my hands on one, and after a long wait, it was finally home.

I spent a reasonable amount of time setting it up, flashing different Linux distros, running a Minecraft server, and even managing to corrupt both the SD card and the hard drive. After a few months, it was time for the actual fun.

The thing is, I love sneakers, but being a size 15 makes it difficult to find them in retail stores. Luckily, Zalando Lounge, a German online fashion discount store, has hundreds of them.

The store works in a similar way to product drops. A few times, I found myself losing a product at a bargain price to bots, until I'd had enough: I was going to create my own. Hellasteez¹ was born.

The architecture was entirely dockerized. I used Docker Swarm to spawn containers at will, a Node.js Express server that acted as the command center and frontend, a Selenium Grid container that performed the login to get a session cookie, and some auxiliary Python scripts to manage the cookie and process the information, which ended up in my self-hosted MongoDB instance.

This was incredibly fun to build, and I learnt a lot. However, debugging was slow and the risk of getting banned or facing API changes was real. In the end, I managed to automatically add a product to my cart, which was a huge win, but there were associated challenges (especially automated payment) that made the project too complex to be worth continuing.

---

¹ If you're curious, I came up with the name from one of my favorite songs by Skepta: "Sitting in front row seats at Louis V with hella steez."
