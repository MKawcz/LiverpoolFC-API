import * as grpc from '@grpc/grpc-js';
import * as portoLoader from '@grpc/proto-loader';

const packageDefinition = portoLoader.loadSync('./proto/player.proto');
const proto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(proto.liverpool.PlayerService.service, {
    GetPlayer: (req, res) => {
        res(null, {
            playerId: 0,
            name: "Mohamed Salah"
        });
    }
});

server.bindAsync("127.0.0.1:9090",grpc.ServerCredentials.createInsecure() , (err) => {
    if (err !== null) {
        console.log(err);
    }
    console.log("Started grpc server");
});
