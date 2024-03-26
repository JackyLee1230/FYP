# CritiQ ![LOGO](./logo_v2.png)

CritiQ is a web application that provides a platform for users to review and rate video games. It also provides a recommendation system that suggests games to users based on their preferences.

This is a Final Year Project (FYP) for the BEng(CompSci) at the University of Hong Kong.

## Table of Contents

- [Getting Started](#getting-started)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Technologies](#technologies)
  - [Project Structure](#project-structure)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Backend

    Backend can be hosted locally or on a cloud platform. The backend is built using Spring Boot.
    If hosted on a Virtual Machine/VPS, make sure to open the required ports.
    If the frontend application is hosted on a platform that provides HTTPS, the backend should also be hosted  on HTTPS.
    HTTPS can be enabled by using a reverse proxy such as Nginx or Apache.
    Our server is hosted on a DigitalOcean Droplet and we use Nginx as the reverse proxy.

- To run the Spring Boot App Locally, please use the **LOCAL** profile which will use the application-local.properties file. The following options can be used.

  - VS Code Extension: Spring Boot Dashboard
  - IntelliJ IDEA's Run/Debug Configuration

  * _**Running in Local Profile will disable the SSL Requirement**_

- Dockerfile and Jenkinsfile are provided for self-deployment and CI/CD.

#### Properties File:

Modifies the properties below in the **application.properties** file.

```properties
SSL Certificate:
  # Use the Key Store Password used while creating the keystore with Certbot
  # See 1. SELF SIGNING (Let's Encrypt and Certbot)
  server.ssl.key-store-password=
Email (Gmail is used here for Email Verification and Authentication):
  # If Gmail is used, create an app password instead of using the account password
  spring.mail.username=
  spring.mail.password=
  spring.mail.host=
  spring.mail.port=
  # URL is used as URL prefix for authentication related email
  application.web.url=https://critiq.itzjacky.info
JWT (Spring Security):
  application.security.jwt.secret-key=
MySQL Database:
  # If Digital Ocean's Managed Database is used, sql_require_primary_key should be disabled
  # https://www.digitalocean.com/community/questions/how-to-disable-sql_require_primary_key-in-digital-ocean-manged-database-for-mysql
  spring.datasource.username=
  spring.datasource.password=
  # use a JDBC URL for the MySQL database
  spring.datasource.url=
S3 Bucket (Digital Ocean Space is used, AWS S3 can also be used direcyly):
  do.space.key=
  do.space.secret=
  do.space.endpoint=
  do.space.region=
  do.space.bucket=
RabbitMQ Host and Port:
  spring.rabbitmq.host=
  spring.rabbitmq.port=
  spring.rabbitmq.username=
  spring.rabbitmq.password=
  # Modifies the Queue and Exchange name as needed
```

#### 1. SELF SIGNING (Let's Encrypt and Certbot)

A VALID DOMAIN IS REQUIRED FOR SELF-SIGNING. </br>
If you are using a self-signed certificate, you may need to add the certificate to the Java keystore.

```bash
git clone https://github.com/certbot/certbot.git
cd certbot

# Replace critiqbackend.itzjacky.info with your domain
./certbot-auto certonly -a standalone -d critiqbackend.itzjacky.info
cd /etc/letsencrypt/live/critiqbackend.itzjacky.info-0001#

openssl pkcs12 -export -in fullchain.pem -inkey privkey.pem -out keystore.p12 -name tomcat -CAfile chain.pem -caname root
```

<!-- properties file part -->

```properties
# Place the keystore in the backend's src/main/resources directory
# Add the following lines to the application.properties file
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=<password>
server.ssl.keyStoreType=PKCS12
server.ssl.keyAlias=tomcatåå
```

#### 2. Use a Cloud Hosting Solution that provides HTTPS

## Frontend

The frontend can be deployed to Vercel or ran locally.
Modifies the properties below in the **.env** and **.env.production** file.

```properties
S3 Bucket (Digital Ocean Space is used, AWS S3 can also be used direcyly):
  NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX=
  NEXT_PUBLIC_GAMES_STORAGE_HOSTNAME=
JWT Key:
  NEXT_PUBLIC_JWT_KEY=
Backend URL:
  NEXT_PUBLIC_BACKEND_PATH_PREFIX=
```

### Local Run

NPM/Yarn is required. Bun is not supported as of writing.</br>

- Development Server/Mode

  ```bash
  npm run dev
  ```

- Production Build

  ```bash
  npm run build
  npm start
  ```

### Vercel

- Fork this repository and edit the above environment variables and deploy it to Vercel.

## Technologies

This section should list any major frameworks/libraries used to bootstrap your project. Leave any add-ons/plugins for the acknowledgements section. Here are a few examples.

- [![Next][Next.js]][Next-url]
- [![React][React.js]][React-url]
- [![SpringBoot][SpringBoot]][SpringBoot-url]

## Project Structure

A brief explanation of the project's directory structure.

- `Backend/`: Contains the backend code of the project.
- `Frontend/`: Contains the frontend code of the project.
- `NLP/`: Contains the Natural Language Processing related code.
- `Gatling/`: Contains the Gatling performance test scripts.
- `dump-FYP-202309081844.sql`: SQL dump file for the database.
- `SaveToDB.py`: Python script to save data to the database.
- `steam-review-scraper.ipynb`: Jupyter notebook for scraping Steam reviews.

## License

This project is muti-licensed under Apache License 2.0 and TBD.
Please see LICENSE.md for more detail

`SPDX-License-Identifier: Apache-2.0`

## Contact

@JackLee1230: justjackypvp@gmail.com

[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[SpringBoot-url]: https://spring.io/projects/spring-boot
[SpringBoot]: https://img.shields.io/badge/SpringBoot-6DB33F?style=flat-square&logo=Spring&logoColor=white

```

```

