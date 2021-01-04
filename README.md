# Memory Game

# Run application locally using Docker

- Build and run docker image
```
docker-compose build web
docker-compose up web
```
- Open in browser 
    - http://localhost/numbers.html or 
    - http://localhost/cards.html

# Deploy a containerized application on Azure Kubernetes Service
## Create an Azure Kubernetes Service cluster

- Sign in to Azure Cloud Shell
- Set default region
```
az configure --defaults location=westeurope
```

- Create variables
```
RESOURCE_GROUP=rg-memorygame
CLUSTER_NAME=aks-memorygame
ACR_NAME=acrmemorygame$RANDOM
```

- Create resource group
```
az group create --name $RESOURCE_GROUP
```

- Create AKS cluster
```
az aks create \
  --resource-group $RESOURCE_GROUP \
  --name $CLUSTER_NAME \
  --node-count 2 \
  --enable-addons http_application_routing \
  --dns-name-prefix memorygame-kubernetes-$RANDOM \
  --generate-ssh-keys \
  --node-vm-size Standard_B2s
```

## Deploy an application on your Azure Kubernetes Service cluster

- Create container registry
```
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME\
  --sku Basic
```

- Attach AKS to container registry
```
az aks update \
  --name $CLUSTER_NAME \
  --resource-group $RESOURCE_GROUP \
  --attach-acr $ACR_NAME
```

### Push a container image to Container Registry

- Clone app from the GitHub repository and change into the `memory-game` directory
```
git clone https://github.com/gennadyyonov/memory-game.git
cd memory-game
```

- Build and push the container image
```
az acr build \
  --image memorygame-website \
  --registry $ACR_NAME \
  --file Dockerfile .
```

### Create and apply deployment manifest

- Create deployment manifest
```
cp ./kubernetes/deployment.yaml .
code deployment.yaml
```

- Update the `<acr_name>` value with container registry's name (`ACR_NAME`) then save and close editor.

- Apply deployment manifest
```
kubectl apply -f ./deployment.yaml
```

### Create and deploy the service manifest

```
cp ./kubernetes/service.yaml .
kubectl apply -f ./service.yaml
```

### Create an ingress manifest

```
cp ./kubernetes/ingress.yaml .
code ingress.yaml
```

- Set the fully qualified domain name (FQDN) of the host allowed access to the cluster.
 
    - Query DNS zone list
    ```
    az network dns zone list --output table
    ```
    - Copy uuid of the `ZoneName`, and update the `ingress.yaml`
    - Save and close editor
    
- Deploy the ingress
```
kubectl apply -f ./ingress.yaml
```
## Open in browser

- List all DNS zones again

```
az network dns zone list --output table
```

- Copy the `ZoneName` and `ResourceGroup` columns, and run the `az network dns command`
```
az network dns record-set list -g <resource-group> -z <zone-name> --output table
```

- Use `Fqdn` column value to compose application URL(s) and open them in browser
    - `http://memorygame.<uid>.<region>.aksapp.io./numbers.html`
    - `http://memorygame.<uid>.<region>.aksapp.io./cards.html`
    
## Clean up resources

- Delete resource group
```
az group delete -n $RESOURCE_GROUP
```

- Remove deleted clusters context
```
kubectl config delete-context aks-memorygame
```