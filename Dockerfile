FROM alpine:3.24 AS tools
RUN apk add --no-cache ffmpeg tesseract-ocr tesseract-ocr-data-eng

FROM n8nio/n8n
USER root
COPY --from=tools /usr/lib/ /usr/lib/
COPY --from=tools /usr/bin/ffmpeg /usr/bin/ffmpeg
COPY --from=tools /usr/bin/tesseract /usr/bin/tesseract
COPY --from=tools /usr/share/tessdata/ /usr/share/tessdata/
USER node
