const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Express app setup
const app = express();
app.use(bodyParser.json());

// MySQL Configuration
const connection = mysql.createConnection({
  host: process.env.MYSQL_SERVICE_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

// Connect to MySQL on start
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to db', err.stack);
    return;
  }

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS properties (
      id INT PRIMARY KEY AUTO_INCREMENT,
      location VARCHAR(100),
      square_meters DECIMAL(10, 2),
      price_per_square_meter DECIMAL(10, 2),
      total_price DECIMAL(10, 2),
      owner VARCHAR(50),
      country VARCHAR(50),
      region VARCHAR(50),
      province VARCHAR(50),
      district VARCHAR(50)
    )
  `;

  connection.query(createTableQuery, (err) => {
    if (err) throw err;
    console.log('Connected to MySQL and ensured properties table exists');
  });
});

process.on('SIGINT', () => {
  connection.end(err => {
    if (err) {
      console.error('Error closing MySQL connection', err.stack);
    }
    process.exit();
  });
});

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Property Inventory API',
      version: '1.0.0',
      description: 'API for creating, reading, updating, and deleting properties.',
      contact: {
        name: 'Support',
        url: 'http://example.com',
        email: 'support@example.com'
      }
    },
  },
  apis: ['./app.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Property:
 *       type: object
 *       required:
 *         - location
 *         - square_meters
 *         - price_per_square_meter
 *         - owner
 *         - country
 *         - region
 *         - province
 *         - district
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the property
 *         location:
 *           type: string
 *           description: The location of the property
 *         square_meters:
 *           type: number
 *           format: double
 *           description: The size of the property in square meters
 *         price_per_square_meter:
 *           type: number
 *           format: double
 *           description: The price per square meter of the property
 *         total_price:
 *           type: number
 *           format: double
 *           description: The total price of the property
 *         owner:
 *           type: string
 *           description: The owner of the property
 *         country:
 *           type: string
 *           description: The country where the property is located
 *         region:
 *           type: string
 *           description: The region where the property is located
 *         province:
 *           type: string
 *           description: The province where the property is located
 *         district:
 *           type: string
 *           description: The district where the property is located
 *       example:
 *         id: 1
 *         location: "New York"
 *         square_meters: 120
 *         price_per_square_meter: 2000
 *         total_price: 240000
 *         owner: "John Doe"
 *         country: "USA"
 *         region: "East Coast"
 *         province: "New York"
 *         district: "Brooklyn"
 */

/**
 * @swagger
 * /properties:
 *   get:
 *     summary: Retrieve a list of properties
 *     description: Retrieve a list of properties. Can be used to populate a list of fake properties when prototyping or testing an API client.
 *     responses:
 *       200:
 *         description: A list of properties.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 */
app.get('/properties', (req, res) => {
  connection.query('SELECT * FROM properties', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

/**
 * @swagger
 * /properties:
 *   post:
 *     summary: Create a new property
 *     description: Create a new property with the values provided in the request body.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Property'
 *     responses:
 *       200:
 *         description: The property was successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property registered successfully
 */
app.post('/properties', (req, res) => {
  const { location, square_meters, price_per_square_meter, owner, country, region, province, district } = req.body;
  const totalPrice = price_per_square_meter * square_meters;
  const property = { location, square_meters, price_per_square_meter, total_price: totalPrice, owner, country, region, province, district };
  connection.query('INSERT INTO properties SET ?', property, (err) => {
    if (err) throw err;
    res.json({ message: 'Property registered successfully' });
  });
});

/**
 * @swagger
 * /properties/{id}:
 *   get:
 *     summary: Get a specific property
 *     description: Get a specific property by id.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The id of the property to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The specific property.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       404:
 *         description: The property was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Property not found
 */
app.get('/properties/:id', (req, res) => {
  const id = req.params.id;
  connection.query('SELECT * FROM properties WHERE id = ?', [id], (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      res.status(404).json({ error: 'Property not found' });
    } else {
      res.json(results[0]);
    }
  });
});

/**
 * @swagger
 * /properties/{id}:
 *   put:
 *     summary: Update a property
 *     description: Update a specific property by id.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The id of the property to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Property'
 *     responses:
 *       200:
 *         description: The property was successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property updated successfully
 *       404:
 *         description: The property was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Property not found
 */
app.put('/properties/:id', (req, res) => {
  const id = req.params.id;
  const { location, square_meters, price_per_square_meter, owner, country, region, province, district } = req.body;
  const totalPrice = price_per_square_meter * square_meters;
  const property = { location, square_meters, price_per_square_meter, total_price: totalPrice, owner, country, region, province, district };
  connection.query('UPDATE properties SET ? WHERE id = ?', [property, id], (err, results) => {
    if (err) throw err;
    if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Property not found' });
    } else {
      res.json({ message: 'Property updated successfully' });
    }
  });
});

/**
 * @swagger
 * /properties/{id}:
 *   delete:
 *     summary: Delete a property
 *     description: Delete a specific property by id.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The id of the property to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The property was successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property deleted successfully
 *       404:
 *         description: The property was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Property not found
 */
app.delete('/properties/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM properties WHERE id = ?', [id], (err, results) => {
    if (err) throw err;
    if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Property not found' });
    } else {
      res.json({ message: 'Property deleted successfully' });
    }
  });
});

// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));
