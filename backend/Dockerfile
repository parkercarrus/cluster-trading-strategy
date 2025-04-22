FROM python:3.10

RUN apt-get update && apt-get install -y git-lfs && git lfs install

WORKDIR /app


COPY . .

RUN git lfs pull || true

RUN pip install -r requirements.txt

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
