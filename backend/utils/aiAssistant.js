const normalize = (value = '') => value.toLowerCase().trim();

function getRelevantReports(reports, query, users = []) {
  const lowerQuery = normalize(query);

  const matchedUser = users.find(user => {
    const name = normalize(user.name || '');
    if (!name) return false;

    const nameTokens = name.split(/\s+/).filter(Boolean);
    return nameTokens.some(token => lowerQuery.includes(token));
  });

  const isSpecificPersonQuestion = Boolean(matchedUser) && !(
    lowerQuery.includes('team') ||
    lowerQuery.includes('everyone') ||
    lowerQuery.includes('all users') ||
    lowerQuery.includes('overall') ||
    lowerQuery.includes('summary') ||
    lowerQuery.includes('summarize') ||
    lowerQuery.includes('all employees') ||
    lowerQuery.includes('everyone else')
  );

  if (isSpecificPersonQuestion) {
    const contextReports = reports.filter(report => {
      const reportUserId = report.user && report.user._id ? report.user._id.toString() : '';
      return reportUserId === matchedUser._id.toString();
    });

    return { targetUser: matchedUser, contextReports };
  }

  return { targetUser: null, contextReports: reports };
}

module.exports = {
  getRelevantReports
};
