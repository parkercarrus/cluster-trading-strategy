FROM python:3.10

RUN apt-get update && apt-get install -y git-lfs && git lfs install

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt

EXPOSE 10000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
