{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "site.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "site.labels" -}}
helm.sh/chart: {{ include "site.chart" . }}
{{ include "site.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "site.selectorLabels" -}}
app.kubernetes.io/name: {{ .Values.site.name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
