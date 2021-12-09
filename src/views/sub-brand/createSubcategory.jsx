import React from "react";

import { Editor } from "react-draft-wysiwyg";
import { ImageGallery, imageUploadCallBack } from "src/reusable";
import Select from "react-select";
const CreateSubcategory = ({
  images,
  setImages,
  editorState,
  setEditorState,
  options,
  setBrandName,
  subcategoryName,
  setSubcategoryName,
}) => {
  return (
    <div className="brand-modal-container">
      <div className="row">
        <div className="col-md-6 d-flex justify-content-center">
          <ImageGallery images={images} setImages={setImages} />
        </div>
        <div className="col-md-6 mt-2">
          <form>
            <div className="form-group">
              <label className="label-name">Brand</label>
              <Select
                options={options}
                cacheOptions
                onChange={(e) => setBrandName(e.value)}
              />
            </div>
            <div className="form-group">
              <label className="label-name">Subcategory</label>
              <input
                value={subcategoryName}
                onChange={(e) => setSubcategoryName(e.target.value)}
                type="text"
                className="form-control inputvalue"
                placeholder="Input Subcategory"
              />
            </div>
            <div className="form-group">
              <label className="label-name">
                Brand Subcategory Description
              </label>
              <div className="text-area-description">
                <Editor
                  editorState={editorState}
                  onEditorStateChange={(content) => setEditorState(content)}
                  style={{ padding: "5px" }}
                  toolbar={{
                    image: {
                      className: undefined,
                      component: undefined,
                      popupClassName: undefined,
                      urlEnabled: true,
                      uploadEnabled: true,
                      alignmentEnabled: true,
                      uploadCallback: imageUploadCallBack,
                      previewImage: true,
                      inputAccept: "image/*",
                      defaultSize: {
                        height: "400px",
                        width: "400px",
                      },
                    },
                  }}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default CreateSubcategory;
