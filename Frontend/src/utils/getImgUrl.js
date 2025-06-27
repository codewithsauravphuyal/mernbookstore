const getImgUrl = (imageObj) => {
  if (imageObj && imageObj.url) {
    return imageObj.url;
  }
  // Use a working placeholder service
  return 'https://placehold.co/150x150?text=No+Image';
};

export default getImgUrl;