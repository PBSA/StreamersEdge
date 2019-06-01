/* istanbul ignore file */
class BaseMongoRepository {

  /**
   * @param {RavenHelper} ravenHelper
   * @param {Mongoose.Model} model
   */
  constructor(ravenHelper, model = null) {
    this.ravenHelper = ravenHelper;
    /** @type Mongoose.Model */
    this.model = model;
  }

  /**
   * Finds a single document by its _id field. `findById(id)` is almost*
   * equivalent to `findOne({ _id: id })`. If you want to query by a document's
   * `_id`, use `findById()` instead of `findOne()`.
   *
   * The `id` is cast based on the Schema before sending the command.
   *
   * Note: `findById()` triggers `findOne` hooks.
   *
   * * Except for how it treats `undefined`. If you use `findOne()`, you'll see
   * that `findOne(undefined)` and `findOne({ _id: undefined })` are equivalent
   * to `findOne({})` and return arbitrary documents. However, mongoose
   * translates `findById(undefined)` into `findOne({ _id: null })`.
   *
   * ####Example:
   *
   *     // find adventure by id
   *     `await adventureRepository.findById(id);`
   *
   *     // select only the adventures name and length
   *     `await adventureRepository.findById(id, 'name length');`
   *
   *     // include all properties except for `length`
   *     `await adventureRepository.findById(id, '-length');`
   *
   *     // passing options (in this case return the raw js objects,
   *     not mongoose documents by passing `lean`
   *     `await adventureRepository.findById(id, 'name', { lean: true });`
   *
   * @protected
   * @param {Object|String|Number} id value of `_id` to query by
   * @param {Object} [projection] optional fields to return (http://bit.ly/1HotzBo)
   * @param {Object} [options] optional
   * @return {Promise.<MongooseDocument>}
   */
  findById(id, projection, options) {
    if (typeof id === 'undefined') {
      id = null;
    }

    return this.findOne({_id: id}, projection, options);
  }

  /**
   * Finds one document.
   *
   * The `conditions` are cast to their respective SchemaTypes before the command is sent.
   *
   * *Note:* `conditions` is optional, and if `conditions` is null or undefined,
   * mongoose will send an empty `findOne` command to MongoDB, which will return
   * an arbitrary document. If you're querying by `_id`, use `findById()` instead.
   *
   * ####Example:
   *
   *     // find one iphone adventures - iphone adventures??
   *     `await adventureRepository.findOne({ type: 'iphone' });`
   *
   *     // select only the adventures name
   *     `await adventureRepository.findOne({ type: 'iphone' }, 'name');`
   *
   *     // specify options, in this case lean
   *     `await adventureRepository.findOne({ type: 'iphone' }, 'name', { lean: true });`
   *
   * @protected
   * @param {Object} [conditions]
   * @param {Object} [projection] optional fields to return (http://bit.ly/1HotzBo)
   * @param {Object} [options] optional
   * @return {Promise.<MongooseDocument>}
   */
  async findOne(conditions, projection, options) {
    try {
      return await this.model.findOne(conditions, projection, options);
    } catch (error) {
      throw this.ravenHelper.error(error, 'model findOne');
    }
  }

  /**
   * Finds documents
   *
   * The `conditions` are cast to their respective SchemaTypes before the command is sent.
   *
   * ####Examples:
   *
   *     // named john and at least 18
   *     `await userRepository.find({ name: 'john', age: { $gte: 18 }});`
   *
   *     // name LIKE john and only selecting the "name" and "friends" fields
   *     `await userRepository.find({ name: /john/i }, 'name friends');`
   *
   *     // passing options
   *     `await userRepository.find({ name: /john/i }, null, { skip: 10 });`
   *
   * @protected
   * @param {Object} conditions
   * @param {Object} [projection] optional fields to return (http://bit.ly/1HotzBo)
   * @param {Object} [options] optional
   * @return {Promise.<[MongooseDocument]>}
   */
  async find(conditions, projection, options) {
    try {
      return await this.model.find(conditions, projection, options);
    } catch (error) {
      throw this.ravenHelper.error(error, 'model find');
    }
  }

  /**
   * Shortcut for saving one or more documents to the database.
   * `MyModel.create(docs)` does `new MyModel(doc).save()` for every doc in
   * docs.
   *
   * Hooks Triggered:
   * - `save()`
   *
   * ####Example:
   *
   *     // pass individual doc
   *     `await candyRepository.create({ type: 'jelly bean' });`
   *
   *     // pass an array
   *     <pre>
   *     await candyRepository.create([
   *         { type: 'jelly bean' },
   *         { type: 'snickers' },
   *     ]);
   *     </pre>
   *
   * @protected
   * @param {Object|[Object]} doc document to create (or several docs as array)
   * @return {Promise.<MongooseDocument|[MongooseDocument]>}
   */
  async create(doc) {
    try {
      return await this.model.create(doc);
    } catch (error) {
      throw this.ravenHelper.error(error, 'model create');
    }
  }

  /**
   * Updates one document in the database.
   * Returns number of updated documents
   *
   * ####Examples:
   *
   *     <pre>
   *     await userRepository.update({ age: { $gt: 18 } }, { oldEnough: true });
   *     await userRepository.update({ name: 'Tobi' }, { ferret: true }, { multi: true });
   *     </pre>
   *
   * ####Valid options:
   *
   *  - `safe` (boolean) safe mode (defaults to value set in schema (true))
   *  - `upsert` (boolean) whether to create the doc if it doesn't match (false)
   *  - `multi` (boolean) whether multiple documents should be updated (false)
   *  - `runValidators`: if true, runs [update validators](/docs/validation.html#update-validators)
   *  on this command.
   *  Update validators validate the update operation against the model's schema.
   *  - `setDefaultsOnInsert`: if this and `upsert` are true, mongoose will apply the
   *  [defaults](http://mongoosejs.com/docs/defaults.html) specified in the model's schema if a new document is
   *  created. This option only works on MongoDB >= 2.4 because it relies on
   *  [MongoDB's `$setOnInsert` operator](https://docs.mongodb.org/v2.4/reference/operator/update/setOnInsert/).
   *  - `strict` (boolean) overrides the `strict` option for this update
   *  - `overwrite` (boolean) disables update-only mode, allowing you to overwrite the doc (false)
   *
   * All `update` values are cast to their appropriate SchemaTypes before being sent.
   *
   * The `callback` function receives `(err, rawResponse)`.
   *
   * - `err` is the error if any occurred
   * - `rawResponse` is the full response from Mongo
   *
   * ####Note:
   *
   * All top level keys which are not `atomic` operation names are treated as set operations:
   *
   * ####Example:
   *
   *     `await userRepository.update({ name: 'borne' }, { name: 'jason borne' });`
   *
   *     // is sent as
   *     `await userRepository.update({ name 'borne' }, { $set: { name: 'jason borne' }}, options);`
   *     // if overwrite option is false. If overwrite is true, sent without the $set wrapper.
   *
   * This helps prevent accidentally overwriting all documents
   * in your collection with `{ name: 'jason borne' }`.
   *
   * ####Note:
   *
   * Be careful to not use an existing model instance for the update clause
   * (this won't work and can cause weird behavior like infinite loops).
   * Also, ensure that the update clause does not have an _id property,
   * which causes Mongo to return a "Mod on _id not allowed" error.
   *
   * ####Note:
   *
   * Although values are casted to their appropriate types when using update,
   * the following are *not* applied:
   *
   * - defaults
   * - setters
   * - validators
   * - middleware
   *
   * If you need those features, use the traditional approach of first retrieving the document.
   *
   *     <pre>
   *     const agent = await userRepository({ name: 'borne })
   *     agent.name = 'jason borne'
   *     await agent.save();
   *     </pre>
   *
   * @protected
   * @param {Object} conditions
   * @param {Object} doc
   * @param {Object} [options]
   * @return {Promise.<Number>}
   */
  async update(conditions, doc, options) {
    try {
      return await this.model.update(conditions, doc, options);
    } catch (error) {
      throw this.ravenHelper.error(error, 'model update');
    }
  }

  /**
   *  * Issues a mongodb findAndModify update command by a document's _id field.
   * `findByIdAndUpdate(id, ...)` is equivalent to `findOneAndUpdate({ _id: id }, ...)`.
   *
   * Finds a matching document, updates it according to the `update` arg,
   * passing any `options`, and returns the found document (if any) to the
   * callback. The query executes immediately if `callback` is passed else a
   * Query object is returned.
   *
   * This function triggers the following middleware:
   * - `findOneAndUpdate()`
   *
   * ####Options:
   *
   * - `new`: bool
   * true to return the modified document rather than the original. defaults to false
   * - `upsert`: bool - creates the object if it doesn't exist. defaults to false.
   * - `runValidators`:
   * if true, runs [update validators](/docs/validation.html#update-validators) on this command.
   * Update validators validate the update operation against the model's schema.
   * - `setDefaultsOnInsert`:
   * if this and `upsert` are true, mongoose will apply the
   * [defaults](http://mongoosejs.com/docs/defaults.html) specified in the model's schema
   * if a new document is created.
   * This option only works on MongoDB >= 2.4
   * because it relies on [MongoDB's `$setOnInsert` operator]
   * (https://docs.mongodb.org/v2.4/reference/operator/update/setOnInsert/).
   * - `sort`: if multiple docs are found by the conditions,
   * sets the sort order to choose which doc to update
   * - `select`: sets the document fields to return
   * - `passRawResult`:
   * if true, passes the [raw result from the MongoDB driver as the third callback parameter]
   * (http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#findAndModify)
   * - `strict`: overwrites the schema's [strict mode option]
   * (http://mongoosejs.com/docs/guide.html#strict) for this update
   * - `runSettersOnQuery`: bool if true, run all setters defined on the associated model's schema
   * for all fields defined in the query and the update.
   *
   * ####Note:
   *
   * All top level update keys which are not `atomic` operation names are treated as set operations:
   *
   * ####Example:
   *
   *     `await userRepository.findByIdAndUpdate(id, { name: 'jason borne' }, options)`
   *
   * This helps prevent accidentally overwriting your document with `{ name: 'jason borne' }`.
   *
   * ####Note:
   *
   * Values are cast to their appropriate types when using the findAndModify helpers.
   * However, the below are not executed by default.
   *
   * - defaults. Use the `setDefaultsOnInsert` option to override.
   * - setters. Use the `runSettersOnQuery` option to override.
   *
   * `findAndModify` helpers support limited validation. You can
   * enable these by setting the `runValidators` options,
   * respectively.
   *
   * If you need full-fledged validation, use the traditional approach of first
   * retrieving the document.
   *
   *     const agent = await userRepository.findById(id);
   *     agent.name = 'jason borne';
   *     await agent.save();
   *
   * @protected
   * @param {String} id value of `_id` to query by
   * @param {Object} [update]
   * @param {Object} [options] optional
   * see [`Query.prototype.setOptions()`](http://mongoosejs.com/docs/api.html#query_Query-setOptions)
   * @param {Object} [options.lean]
   * if true, mongoose will return the document as plain JavaScript object instead of document.
   * See [`Query.lean()`](http://mongoosejs.com/docs/api.html#query_Query-lean).
   * @param {Boolean} [options.new]
   * @return {Promise<MongooseDocument>}
   */
  async findByIdAndUpdate(id, update, options) {
    try {
      return await this.model.findByIdAndUpdate(id, update, options);
    } catch (error) {
      throw this.ravenHelper.error(error, 'model findByIdAndUpdate');
    }
  }

  /**
   * Issues a mongodb findAndModify update command.
   *
   * Finds a matching document, updates it according to the `update` arg,
   * passing any `options`, and returns the found document (if any).
   *
   * ####Options:
   *
   * - `new`: bool - if true, return the modified document rather than the original.
   * defaults to false (changed in 4.0)
   *
   * - `upsert`: bool - creates the object if it doesn't exist. defaults to false.
   *
   * - `fields`: {Object|String} - Field selection.
   * Equivalent to `.select(fields).findOneAndUpdate()`
   *
   * - `maxTimeMS`: puts a time limit on the query - requires mongodb >= 2.6.0
   *
   * - `sort`: if multiple docs are found by the conditions,
   * sets the sort order to choose which doc to update
   *
   * - `runValidators`: if true, runs [update validators] on this command.
   * Update validators validate the update operation against the model's schema.
   *
   * - `setDefaultsOnInsert`: if this and `upsert` are true, mongoose will apply the [defaults]
   * specified in the model's schema if a new document is created.
   * This option only works on MongoDB >= 2.4 because it relies on [MongoDB's `$setOnInsert` operator]
   * (https://docs.mongodb.org/v2.4/reference/operator/update/setOnInsert/).
   *
   * - `passRawResult`: if true, passes the [raw result from the MongoDB driver as the third callback parameter]
   * (http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#findAndModify)
   * - `strict`: overwrites the schema's [strict mode option]
   * (http://mongoosejs.com/docs/guide.html#strict) for this update
   *
   * - `runSettersOnQuery`: bool
   * if true, run all setters defined on the associated model's schema
   * for all fields defined in the query and the update.
   *
   * ####Examples:
   *
   *     await repository.findOneAndUpdate(conditions, update, options);
   *     await repository.findOneAndUpdate(conditions, update);
   *     await repository.findOneAndUpdate();
   *
   * ####Note:
   *
   * All top level update keys which are not `atomic` operation names are treated as set operations:
   *
   * ####Example:
   *
   *     await agentRepository.findOneAndUpdate({ name: 'borne }, { name: 'jason borne' }, options);
   *
   *     // is sent as
   *     <pre>
   *     await agentRepository.findOneAndUpdate(
   *         { name: 'borne' },
   *         { $set: { name: 'jason borne' }},
   *         options,
   *     );
   *     </pre>
   *
   * This helps prevent accidentally overwriting your document with `{ name: 'jason borne' }`.
   *
   * ####Note:
   *
   * Values are cast to their appropriate types when using the findAndModify helpers.
   * However, the below are not executed by default.
   *
   * - defaults. Use the `setDefaultsOnInsert` option to override.
   * - setters. Use the `runSettersOnQuery` option to override.
   *
   * `findAndModify` helpers support limited validation. You can
   * enable these by setting the `runValidators` options,
   * respectively.
   *
   * If you need full-fledged validation, use the traditional approach of first
   * retrieving the document.
   *
   *     const agent = await agentRepository.findById(id);
   *     agent.name = 'jason borne';
   *     await agent.save();
   *
   * @protected
   * @param {Object} [conditions]
   * @param {Object} [update]
   * @param {Object} [options] optional see [`Query.prototype.setOptions()`]
   * (http://mongoosejs.com/docs/api.html#query_Query-setOptions)
   * @param {Object} [options.lean]
   * if truthy, mongoose will return the document as plain object rather than a mongoose document.
   * See [`Query.lean()`](http://mongoosejs.com/docs/api.html#query_Query-lean).
   * @param {boolean} [options.new] if true: returns updated object (default - false)
   * @return {Promise<MongooseDocument>}
   */
  async findOneAndUpdate(conditions, update, options) {
    try {
      return await this.model.findOneAndUpdate(conditions, update, options);
    } catch (error) {
      throw this.ravenHelper.error(error, 'model findOneAndUpdate');
    }
  }

  /**
   * Removes all documents that match `conditions` from the collection.
   * To remove just the first document that matches `conditions`, set the `single`
   * option to true.
   *
   * ####Example:
   *
   *     `await characterRepository.remove({ name: 'Eddard Stark' });`
   *
   * ####Note:
   *
   * This method sends a remove command directly to MongoDB, no Mongoose documents
   * are involved. Because no Mongoose documents are involved, _no middleware
   * (hooks) are executed_.
   *
   * @protected
   * @param {Object} conditions
   */
  async remove(conditions) {
    try {
      return await this.model.remove(conditions);
    } catch (error) {
      throw this.ravenHelper.error(error, 'model remove');
    }
  }

  /**
   * Deletes all of the documents that match `conditions` from the collection.
   * Behaves like `remove()`, but deletes all documents that match `conditions`
   * regardless of the `single` option.
   *
   * ####Example:
   *
   *     Character.deleteMany({ name: /Stark/, age: { $gte: 18 } }, function (err) {});
   *
   * ####Note:
   *
   * Like `Model.remove()`, this function does **not** trigger `pre('remove')` or `post('remove')` hooks.
   *
   * @param {Object} conditions
   * @param {Object} [options] optional see [`Query.prototype.setOptions()`]
   * (http://mongoosejs.com/docs/api.html#query_Query-setOptions)
   * @param {Function} [callback]
   * @return {Query}
   * @api public
   */
  async deleteMany(conditions) {
    try {
      return await this.model.deleteMany(conditions);
    } catch (error) {
      throw this.ravenHelper.error(error, 'model deleteMany');
    }
  }

  /**
   * Counts number of matching documents in a database collection.
   *
   * ####Example:
   *
   *     const count = await adventureRepository.count({ type: 'jungle' });
   *     console.log('there are %d jungle adventures', count);
   *
   * @protected
   * @param {Object?} conditions
   * @return {Number}
   */
  async count(conditions) {
    try {
      return await this.model.count(conditions || {});
    } catch (error) {
      throw this.ravenHelper.error(error, 'model count');
    }
  }

  /**
   * Performs [aggregations](http://docs.mongodb.org/manual/applications/aggregation/) on the models collection.
   *
   * The `aggregate` is executed and a `Promise` is returned.
   *
   * This function does not trigger any middleware.
   *
   * ####Example:
   *
   *     // Find the max balance of all accounts
   *     const maxBalance = await userRepository.aggregate({
   *         $group: {
   *             _id: null,
   *             maxBalance: { $max: '$balance' },
   *         },
   *     }, {
   *         $project: {
   *             _id: 0,
   *             maxBalance: 1,
   *         },
   *     });
   *
   *     // Or use the aggregation pipeline builder.
   *     const maxBalance = await userRepository.aggregate()
   *         .group({
   *             _id: null,
   *             maxBalance: { $max: '$balance' },
   *         })
   *         .select('-id maxBalance')
   *         .exec();
   *
   * ####NOTE:
   *
   * - Arguments are not cast to the model's schema
   * because `$project` operators allow redefining the "shape" of the documents at any stage of the pipeline,
   * which may leave documents in an incompatible format.
   * - The documents returned are plain javascript objects, not mongoose documents
   * (since any shape of document can be returned).
   * - Requires MongoDB >= 2.1
   *
   * @see MongoDB http://docs.mongodb.org/manual/applications/aggregation/
   * @protected
   * @param {Object|Array} aggregation pipeline operator(s) or operator array
   * @return {Promise}
   */
  async aggregate(aggregation) {
    try {
      return await this.model.aggregate(aggregation);
    } catch (error) {
      throw this.ravenHelper.error(error, 'model aggregate');
    }
  }

  /**
   * Declare and/or execute this query as an updateOne() operation. Same as
   * `update()`, except it does not support the `multi` or `overwrite` options.
   *
   * - MongoDB will update _only_ the first document that matches `criteria` regardless of the
   *      value of the `multi` option.
   * - Use `replaceOne()` if you want to overwrite an entire document rather than using atomic operators like `$set`.
   *
   * **Note** updateOne will _not_ fire update middleware. Use `pre('updateOne')`
   * and `post('updateOne')` instead.
   *
   * This function triggers the following middleware.
   *
   * - `updateOne()`
   *
   * @param {Object} [conditions]
   * @param {Object} [doc] the update command
   * @param {Object} [options]
   * @param {Boolean} [options.multipleCastError] by default, mongoose only returns the first error that
   * occurred in casting the query. Turn on this option to aggregate all the cast errors.
   * @param {Function} [callback] params are (error, writeOpResult)
   * @return {Query} this
   * @see Model.update #model_Model.update
   * @see update http://docs.mongodb.org/manual/reference/method/db.collection.update/
   * @see writeOpResult http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#~WriteOpResult
   * @api public
   */
  async updateOne(conditions, doc, options, callback) {
    try {
      return await this.model.updateOne(conditions, doc, options, callback);
    } catch (error) {
      throw this.ravenHelper.error(error, 'update one');
    }
  }

}

module.exports = BaseMongoRepository;
