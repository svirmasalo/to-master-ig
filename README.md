# to-master-ig
Gets some crazy scientific business intelligence (hype alert!) data to master ones IG usage

## How to
- yarn install
- get your IG dev credentials
- Set `CLIENT_ID` and `CLIENT_SECRET` to your **.env** -file
- Run command `node api.js`
- Navigate to `http://localhost:PORT/igauth`
- Grab your access token and paste it to `ACCESS_TOKEN` in **.env**-file
- Make **GET** -request to your server `http://localhost:PORT/recent`
- Profit

## Credits
- node-instagram, Leo Pradel, https://github.com/pradel/node-instagram#readme