const faker = require('faker');
const { parse } = require('./../../utils/app.util');
const { sequelize, Meeting, User } = require('./../../models');

describe('Meeting Unit Test', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  it('should belong to an owner', async () => {
    const meeting = await Meeting.create({
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph()
    });

    let meetingOwner = await meeting.getOwner();
    expect(meetingOwner).toBeNull();

    const user = await User.create({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    });
    await meeting.setOwner(user);

    meetingOwner = await meeting.getOwner();
    expect(meetingOwner).toBeInstanceOf(User);
    expect(parse(meetingOwner)).toEqual(expect.objectContaining(parse(user)));
  });
});
