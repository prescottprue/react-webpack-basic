module.exports = {
 entry: ["./global.js" , "./src/index.js"],
 output: {
   filename: "./dist/bundle.js"
 },
 module: {
   loaders: [
     {
       test: [/\.js$/, /\.es6$/],
       exclude: /node_modules/,
       loader: 'babel-loader',
       query:{
         presets:['es2015', 'react']
       }
     }
   ]
 },
 resolve: {
   extensions: ['', '.js', '.es6']
 }
}
