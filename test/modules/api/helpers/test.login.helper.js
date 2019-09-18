module.exports.login = async (agent, validObject, apiModule) => {

  if (!validObject) {
    validObject = {
      email: 'testglobal@email.com',
      username: 'test-global',
      password: 'MyPassword^007',
      repeatPassword: 'MyPassword^007'
    };
  }

  let response = await agent.post('/api/v1/auth/sign-in').send({
    login: validObject.email,
    password: validObject.password
  });

  if (response.status === 200) {
    return response;
  }

  await agent.post('/api/v1/auth/logout');
  const res = await agent.post('/api/v1/auth/sign-up').send(validObject);
  const {body} = res;
  const {token} = await apiModule.dbConnection.sequelize.models['verification-tokens'].findOne({
    where: {userId: body.result.id}
  });
  await agent.get(`/api/v1/auth/confirm-email/${token}`);
  return await agent.post('/api/v1/auth/sign-in').send({
    login: validObject.email,
    password: validObject.password
  });
};
