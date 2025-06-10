const getImgUrl = (imageObj) => {
  if (imageObj && imageObj.url) {
    return imageObj.url;
  }
  return 'https://via.placeholder.com/150'; // Fallback image URL
};

export default getImgUrl;