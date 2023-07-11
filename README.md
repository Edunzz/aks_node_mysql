# Simple Application Node and Mysql

# docker create image and upload
docker build -t edunzz/node-app:1.0 .
<br>
docker login
<br>
docker push edunzz/node-app:1.0
<br>
docker run -d -p 3000:3000 edunzz/node-app:1.0 # Levantar imagen en localhost

# Deploy on AKS cluster aks_simple_ap_node_mysql
kubectl create namespace mynap
<br>
kubectl apply -f mysql-secret.yaml -n mynap
<br>
kubectl apply -f mysql-deployment.yaml -n mynap
<br>
kubectl apply -f mysql-service.yaml -n mynap
<br>
kubectl apply -f app-deployment.yaml -n mynap
<br>
kubectl apply -f app-service.yaml -n mynap
<br>
kubectl get svc -n mynap
<br>

# Open Telemetry Collector
kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml
<br>
export DT_API_TOKEN={TOKEN}
<br>
export DT_OTLP_ENDPOINT=https://{TENANT}/api/v2/otlp
<br>
export OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE=delta
<br>
kubectl apply -f opentelemetry-deployment.yaml -n mynap

# Links
http://localhost:3000/api-docs/
<br>
http://{IP}:3000/api-docs/

# Author
Jose Romero
