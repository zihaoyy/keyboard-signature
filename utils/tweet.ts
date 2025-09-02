const generateTweetText = (name: string) => {
  const baseText = `Just claimed my digital signature for '${name}'!`;
  const signatureUrl = `${process.env.NEXT_PUBLIC_URL}/${name.toLowerCase()}`;
  return `${baseText}\n\n${signatureUrl}`;
};

export const getTweetUrl = (name: string) => {
  const tweetText = encodeURIComponent(generateTweetText(name));
  return `https://twitter.com/intent/tweet?text=${tweetText}`;
};
