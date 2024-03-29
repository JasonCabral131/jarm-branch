import React from "react";
import { Carousel } from "react-bootstrap";

const BrandCarousel = ({ brand }) => {
  console.log(brand);
  return (
    <Carousel className="w-100">
      {brand?.images.map((data) => {
        return (
          <Carousel.Item>
            <img
              className="d-block w-100"
              src={data.img}
              alt={brand.brand}
              style={{ height: "450px" }}
            />
            <Carousel.Caption>
              <h3>{""}</h3>
              <p dangerouslySetInnerHTML={{ __html: brand.description }} />
            </Carousel.Caption>
          </Carousel.Item>
        );
      })}
    </Carousel>
  );
};

export default BrandCarousel;
