const sharp = require("sharp");
const multer = require("multer");

const User = require("./../models/userModel");
const catchAsync = require("./../services/catchAsync");
const customError = require("./../services/customError");

const filterBody = (body, ...args) => {
  Object.keys(body).forEach((element) => {
    if (args.includes(element)) {
      delete body[element];
    }
  });
  return body;
};

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new customError("Not an image!, Please upload only images", 400));
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single("photo");
exports.ResizeImage = async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/users/${req.file.filename}`);

  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  const filtered = filterBody(
    req.body,
    "email",
    "username",
    "password",
    "isVerified",
    "role"
  );
  if (req.file) filtered.photo = req.file.filename;

  const updated = await User.findByIdAndUpdate(req.user.id, filtered, {
    new: true,
  });

  res.status(200).json({ status: "success", data: updated });
});
