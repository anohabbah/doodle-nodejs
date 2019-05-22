const Faker = require('faker');
const _ = require('lodash');
const { parse } = require('./../../utils/app.util');
const { sequelize, Meeting, User } = require('./../../models');

describe('Meeting Unit Test', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  it('should belong to an owner', async () => {
    const meeting = await Meeting.create({
      title: Faker.lorem.sentence(),
      description: Faker.lorem.text()
    });

    let meetingOwner = await meeting.getOwner();
    expect(meetingOwner).toBeNull();

    const user = await User.create({
      name: Faker.name.findName(),
      email: Faker.internet.email(),
      password: Faker.internet.password()
    });
    await meeting.setOwner(user);

    meetingOwner = await meeting.getOwner();
    expect(meetingOwner).toBeInstanceOf(User);
    expect(parse(meetingOwner)).toEqual(expect.objectContaining(parse(user)));
  });

  it('should have participants', async () => {
    const meeting = await Meeting.create({
      title: Faker.lorem.sentence(),
      description: Faker.lorem.text()
    });
    let participants = await meeting.getParticipants();
    expect(participants).toStrictEqual([]);

    const user1 = await User.create({
      name: Faker.name.findName(),
      email: Faker.internet.email(),
      password: Faker.internet.password()
    });
    const user2 = await User.create({
      name: Faker.name.findName(),
      email: Faker.internet.email(),
      password: Faker.internet.password()
    });

    await meeting.setParticipants([user1, user2]);
    participants = await meeting.getParticipants();
    participants = _.map(parse(participants), p =>
      _.omit(p, 'MeetingParticipant')
    );
    expect(participants).toEqual(expect.arrayContaining([parse(user1)]));
    expect(participants).toEqual(expect.arrayContaining([parse(user2)]));
  });
});
