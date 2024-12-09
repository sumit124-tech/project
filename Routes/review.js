const express = require("express");
const router=express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const review = require("../models/reviews.js");
const Listing = require("../models/listing.js");


const validateReview = (req, res, next) =>{
    let { error } = reviewSchema.validate(req.body);
    if (error) {
     let errMsg = error.details.map((el) => el.message).join(",");
     throw new ExpressError(400, errMsg);
    }
    else {
     next();
    }
 };

router.post("/",validateReview, wrapAsync(async(req, res,) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new review(req.body.review);
    console.log(newReview);
    listing.reviews.push(newReview);
    await newReview.save();
    
    await listing.save();
    
    req.flash("success", "New review created");
    res.redirect(`/listings/${listing._id}`);
}));



//delete review route

router.delete("/:reviewId", wrapAsync(async (req, res) =>{
    let { id, reviewId} =  req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted");
    res.redirect(`/listings/${id}`);

}));

module.exports = router;