FROM node:lts AS frontend
# proxy are necessary if running on intel intranet
ENV http_proxy=http://proxy01.iind.intel.com:911/
ENV https_proxy=http://proxy01.iind.intel.com:911/

ADD ui ui
RUN cd ui; npm install && npm run build;

FROM gar-registry.caas.intel.com/aice/aice-pytorch:1.17.0_b AS backend
WORKDIR /app
ARG HF_TOKEN

# proxy are necessary if running on intel intranet
ENV http_proxy=http://proxy01.iind.intel.com:911/
ENV https_proxy=http://proxy01.iind.intel.com:911/
ENV HF_TOKEN=${HF_TOKEN}

ADD . .
RUN git clone https://github.com/huggingface/optimum-habana;
RUN git clone https://github.com/HabanaAI/DeepSpeed;
RUN cd optimum-habana;
RUN pip install .;
RUN cd ..;
RUN cd DeepSpeed;
RUN pip install .;
RUN cd ..;
RUN pip install -e .
RUN pip install mlflow

COPY --from=frontend /ui/out /app/ui/out
COPY --from=frontend /ui/public /app/ui/public

WORKDIR /app/backend
CMD ["autotrain", "app", "--port", "8000", "--host", "0.0.0.0"] 