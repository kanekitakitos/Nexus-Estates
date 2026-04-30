FROM maven:3.9.9-eclipse-temurin-23 AS build

WORKDIR /workspace

ARG SERVICE
ARG VERSION=1.0.0

COPY pom.xml /workspace/pom.xml
COPY api-gateway/pom.xml /workspace/api-gateway/pom.xml
COPY booking-service/pom.xml /workspace/booking-service/pom.xml
COPY property-service/pom.xml /workspace/property-service/pom.xml
COPY user-service/pom.xml /workspace/user-service/pom.xml
COPY sync-service/pom.xml /workspace/sync-service/pom.xml
COPY finance-service/pom.xml /workspace/finance-service/pom.xml
COPY common-library/pom.xml /workspace/common-library/pom.xml

RUN test -n "$SERVICE"
RUN mvn -B -pl "${SERVICE}" -am dependency:go-offline

COPY . /workspace

RUN mvn -B -pl "${SERVICE}" -am package -DskipTests

FROM eclipse-temurin:23-jre

WORKDIR /app

ARG SERVICE
ARG VERSION=1.0.0

RUN test -n "$SERVICE"

COPY --from=build "/workspace/${SERVICE}/target/${SERVICE}-${VERSION}.jar" /app/app.jar

ENV SERVER_PORT=8080

EXPOSE 8080

ENTRYPOINT ["java","-jar","/app/app.jar"]
