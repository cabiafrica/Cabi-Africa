const regex = /https?:\/\/([^/]+\.)?cabi\.africa$/;
const origins = [
  'https://admin.cabi.africa',
  'http://admin.cabi.africa',
  'https://cabi.africa',
  'http://cabi.africa',
  'https://any.sub.cabi.africa'
];

origins.forEach(origin => {
  console.log(`${origin}: ${regex.test(origin)}`);
});
