FROM mongo
WORKDIR /usr/src/configs
COPY replicaSet.js .
COPY setup.sh .
RUN chmod 777 -R /usr/src/configs
CMD ["./setup.sh"]