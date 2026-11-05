# Imagem do backend SpendWise para hospedagem (Render e similares).
# Etapa 1: compila o projeto com o Maven Wrapper. Etapa 2: imagem leve só com o jar.
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN chmod +x mvnw && ./mvnw -B -q package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/spendwise-backend-1.0.0.jar app.jar
# Planos gratuitos têm cerca de 512 MB: limita o uso de memória do Java
ENV JAVA_TOOL_OPTIONS="-Xmx320m -XX:+UseSerialGC"
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
