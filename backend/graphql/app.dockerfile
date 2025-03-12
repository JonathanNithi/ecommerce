FROM golang:1.23-alpine3.20 AS build
RUN apk --no-cache add gcc g++ make ca-certificates git && \
go install github.com/go-delve/delve/cmd/dlv@latest
WORKDIR /go/src/github.com/JonathanNithi/ecommerce/backend
COPY go.mod go.sum ./
COPY vendor vendor
COPY account account
COPY catalog catalog
COPY order order
COPY graphql graphql
RUN GO111MODULE=on go build -mod vendor -o /go/bin/app ./graphql

FROM alpine:3.20
WORKDIR /usr/bin
COPY --from=build /go/bin .
EXPOSE 8080
#CMD ["app"]

EXPOSE 2345  

# Command to run the app and run delve in the background
CMD dlv exec /usr/bin/app --headless --listen=:2345 --api-version=2 --accept-multiclient --log & \
    /usr/bin/app