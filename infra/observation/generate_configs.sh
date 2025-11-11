#!/bin/bash
# generate_configs.sh - Script to generate configuration files from templates
# Usage: bash generate_configs.sh <environment>

# Ensure script is executable
# chmod +x generate_configs.sh

# Get environment from command line argument
# ENVIRONMENT=${1:-development}
# echo "Generating configuration files"

# # Base directories
PULUMI_CWD=$(pwd)
OBSERVATION_BASE_DIR="${PULUMI_CWD}/observation"
OBSERVATION_TEMPLATES_DIR="${OBSERVATION_BASE_DIR}/templates"

# # Create necessary directories if they don't exist
mkdir -p "${OBSERVATION_BASE_DIR}/prometheus"
mkdir -p "${OBSERVATION_BASE_DIR}/loki"
mkdir -p "${OBSERVATION_BASE_DIR}/promtail"
mkdir -p "${OBSERVATION_BASE_DIR}/alertmanager"
mkdir -p "${OBSERVATION_BASE_DIR}/grafana/provisioning/datasources"
mkdir -p "${OBSERVATION_BASE_DIR}/grafana/provisioning/dashboards"
LOG_FILE="${OBSERVATION_BASE_DIR}/logs.log"

touch "${LOG_FILE}"
echo "Finished mkdirs" >> "${LOG_FILE}"

# Function to replace variables in a template file
replace_variables() {
    local template_file=$1 output_file=$2
    echo "Processing template: $template_file -> $output_file" >> "${LOG_FILE}"
    perl -pe 's/\$\{(\w+)\}/$ENV{$1} || "\${$1}"/ge' "$template_file" > "$output_file"
    echo "Generated: $output_file" >> "${LOG_FILE}"
}

# # Generate Prometheus configuration
echo "Generate Prometheus configuration" >> "${LOG_FILE}"

if [ -f "${OBSERVATION_TEMPLATES_DIR}/prometheus.template.yaml" ]; then
    replace_variables "${OBSERVATION_TEMPLATES_DIR}/prometheus.template.yaml" "${OBSERVATION_BASE_DIR}/prometheus/prometheus.yaml"
else
    echo "Warning: Prometheus template not found at ${OBSERVATION_TEMPLATES_DIR}/prometheus.template.yaml" >> "${LOG_FILE}"
fi

# Generate Loki configuration
echo "Generate Loki configuration" >> "${LOG_FILE}"
if [ -f "${OBSERVATION_TEMPLATES_DIR}/loki.template.yaml" ]; then
    replace_variables "${OBSERVATION_TEMPLATES_DIR}/loki.template.yaml" "${OBSERVATION_BASE_DIR}/loki/loki.yaml"
else
    echo "Warning: Loki template not found at ${OBSERVATION_TEMPLATES_DIR}/loki.template.yaml" >> "${LOG_FILE}"
fi

# Generate Promtail configuration
echo "Generate Promtail configuration"
if [ -f "${OBSERVATION_TEMPLATES_DIR}/promtail.template.yaml" ]; then
    replace_variables "${OBSERVATION_TEMPLATES_DIR}/promtail.template.yaml" "${OBSERVATION_BASE_DIR}/promtail/promtail.yaml"
else
    echo "Warning: Promtail template not found at ${OBSERVATION_TEMPLATES_DIR}/promtail.template.yaml" >> "${LOG_FILE}"
fi

# Generate Alertmanager configuration
echo "Generate Alertmanager configuration"
if [ -f "${OBSERVATION_TEMPLATES_DIR}/alertmanager.template.yaml" ]; then
    replace_variables "${OBSERVATION_TEMPLATES_DIR}/alertmanager.template.yaml" "${OBSERVATION_BASE_DIR}/alertmanager/alertmanager.yaml"
else
    echo "Warning: Alertmanager template not found at ${OBSERVATION_TEMPLATES_DIR}/alertmanager.template.yaml"
fi

# # Generate Grafana datasources
# echo "Generate Grafana configuration"
# if [ -f "${OBSERVATION_TEMPLATES_DIR}/datasources.template.yaml" ]; then
#     replace_variables "${OBSERVATION_TEMPLATES_DIR}/datasources.template.yaml" "${OBSERVATION_BASE_DIR}/grafana/provisioning/datasources/datasources.yaml"
# else
#     echo "Warning: Grafana datasources template not found at ${OBSERVATION_TEMPLATES_DIR}/datasources.template.yaml"
# fi

# # Generate Grafana dashboard provisioning
# echo "Generate Grafana dashboard configuration"
# if [ -f "${OBSERVATION_TEMPLATES_DIR}/dashboards.template.yaml" ]; then
#     replace_variables "${OBSERVATION_TEMPLATES_DIR}/dashboards.template.yaml" "${OBSERVATION_BASE_DIR}/grafana/provisioning/dashboards/dashboards.yaml"
# else
#     echo "Warning: Grafana dashboards template not found at ${OBSERVATION_TEMPLATES_DIR}/dashboards.template.yaml"
# fi

# # Process all dashboard templates
# if [ -d "${OBSERVATION_TEMPLATES_DIR}/dashboards" ]; then
#     mkdir -p "${OBSERVATION_BASE_DIR}/grafana/provisioning/dashboards/json"
    
#     for dashboard_template in "${OBSERVATION_TEMPLATES_DIR}/dashboards"/*.json.template; do
#         if [ -f "$dashboard_template" ]; then
#             # Extract filename without path and extension
#             filename=$(basename "$dashboard_template" .json.template)
#             replace_variables "$dashboard_template" "${OBSERVATION_BASE_DIR}/grafana/provisioning/dashboards/json/${filename}.json"
#         fi
#     done
# else
#     echo "Warning: Grafana dashboard templates directory not found at ${OBSERVATION_TEMPLATES_DIR}/dashboards"
# fi

echo "Configuration generation complete" >> "${LOG_FILE}"