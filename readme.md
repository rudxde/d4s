# d4s
d4s stands for Docker Swarm Secret Sharing Service.


## Install

on a manager node run the following command:

```
docker run -d --name d4s --restart always --hostname d4s --privileged -v /var/run/docker.sock:/var/run/docker.sock d4s:latest
```

## Usage

To generate a public-private key pair make an http put request to the route `http://d4s/privatekey`.
The name of the service the private-key is required, needs to be put in the request body in the `issuer` property.
The private key will be mounted as a secret named `privatekey`.

To get the public key of another service, make a put request to the route `http://d4s/publickey/{servicename}`.
Like the private key procedure, an issuer is required in the request body. The public key will be mounted as a secret, named with the service name followed by the suffix `_publickey`.
