// TODO: Make this to be only config loading, no hardcoded config
export default {
    host: "",
    port: null,
    username: "",
    password: "m",
    database: "",
    
    max: 3,
    idleTimeout: 30, // Close idle connections after 30s
    maxLifetime: 1200, // Max connection lifetime 20 mins
    connectionTimeout: 10, // Connection timeout 10s

    url: "", // url: "postgres://jimmyis:mysecretpassword@linux-hs-1:5442/jimmyis-bubble"
    
    adapter: "",
    tls: false,
    bigint: false,
}
