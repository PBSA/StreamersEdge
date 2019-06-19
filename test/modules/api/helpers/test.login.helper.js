module.exports.login = async (agent, validObject, apiModule) => {

  if (!validObject) {
    validObject = {
      email: 'testglonal@email.com',
      username: 'test-testglonal',
      password: 'MyPassword^',
      repeatPassword: 'MyPassword^'
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
  const {body} = await agent.post('/api/v1/auth/sign-up').send(validObject);
  const {token} = await apiModule.dbConnection.sequelize.models['verification-token'].findOne({
    where: {userId: body.result.id}
  });
  await agent.get(`/api/v1/auth/confirm-email/${token}`);
  return await agent.post('/api/v1/auth/sign-in').send({
    login: validObject.email,
    password: validObject.password
  });
};
