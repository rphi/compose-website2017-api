FROM phusion/passenger-customizable:0.9.26

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install -y yarn
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN rm -f /etc/service/nginx/down
RUN rm /etc/nginx/sites-enabled/default
RUN mkdir /home/app/compsoc-api

ADD nginx-compsoc-api.conf /etc/nginx/sites-enabled/compsoc-api.conf
ADD nginx-env.conf /etc/nginx/main.d/compsoc-api.conf

ADD package.json /home/app/compsoc-api/package.json
WORKDIR /home/app/compsoc-api
RUN yarn

ADD . /home/app/compsoc-api

CMD ["/sbin/my_init"]
EXPOSE 80