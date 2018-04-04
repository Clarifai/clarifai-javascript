/**
 * Region / bounding box. Region points are percentages from the edge.
 * E.g. top of 0.2 means the cropped input will start 20% down from the original edge.
 * @class
 */
class Region {
  constructor(_config, data) {
    this.id = data.id;
    this.top = data.region_info.bounding_box.top_row;
    this.left = data.region_info.bounding_box.left_col;
    this.bottom = data.region_info.bounding_box.bottom_row;
    this.right = data.region_info.bounding_box.right_col;
  }
}

module.exports = Region;
