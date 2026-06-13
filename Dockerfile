FROM python:3.10-slim

WORKDIR /code

COPY backend/requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY backend/ /code/

RUN mkdir -p uploads/screenshots

EXPOSE 7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
