const HtmlWebPackPlugin = require('html-webpack-plugin');
const path = require('path');

const templatesData = [
    {
        template: path.join(__dirname, 'views', 'index.html'), 
        filename: './index.html', 
        entry: path.join(__dirname, 'public', 'JSX', 'pages', 'app', 'app.jsx'), 
        output: { path: path.join(__dirname, 'dist', 'index'), filename: '[name].js', publicPath: '/' }
    }
];

const templates = templatesData.map(({template, filename, entry, output}) => {
    return {
        entry,
        output,
        plugins: [new HtmlWebPackPlugin({template, filename})],
        module: {
			rules: [{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
				    loader: "babel-loader"
				}
			}, {
				test: /\.s?css$/,
  				use: [{
                      loader: 'style-loader',
                      options: {injectType: 'styleTag'}
                    }, 'css-loader'
                ]
            },{
                test: /\.(png|svg|jpg|gif)$/,
                use: [ 'file-loader']
            }]
		}
    }
});

module.exports = templates;