---
sidebar_position: 2
---

# Example Data
Sample data is stored in /rest/data.json.
You can fetch it to your database with using `seed.js` file

1. Go to rest directory
```
cd rest
```
2. Run script

```
node seed.js
```


* If the script does not work, make sure your database connection is properly configured in the `/rest/config/db.js` file
* If it worked, it will create new database and populate it with data from all resources

