function compareTime(timesTring1, timesTring2) {
  let datetime1 = new Date(timesTring1);
  let datetime2 = new Date(timesTring2);

  return datetime1.getTime() < datetime2.getTime();
}

module.exports = {
    compareTime
}