import * as grpc from '@grpc/grpc-js';
import * as portoLoader from '@grpc/proto-loader';

const packageDefinition = portoLoader.loadSync('./proto/player.proto');
const proto = grpc.loadPackageDefinition(packageDefinition);

const client = new proto.liverpool.PlayerService("127.0.0.1:9090", grpc.ChannelCredentials.createInsecure());

client.GetPlayer(null, (error, res) => {
    console.log(res);
});
