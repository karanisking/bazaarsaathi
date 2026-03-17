const Category = require('../models/category')


const { validate, categorySchema, updateCategorySchema } = require('../utils/validator')

const toSlug = (str) =>
  str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')


const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    res.status(200).json({ success: true, message: 'Categories fetched.', data: categories })
  } catch (err) {
    next(err)
  }
}

const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug })
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' })
    }
    res.status(200).json({ success: true, message: 'Category fetched.', data: category })
  } catch (err) {
    next(err)
  }
}


const createCategory = async (req, res, next) => {
  try {
    const data = validate(categorySchema, req.body)
    const slug = toSlug(data.name)

    const exists = await Category.findOne({ slug })
    if (exists) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists.' })
    }

    const category = await Category.create({ ...data, slug })
    res.status(201).json({ success: true, message: 'Category created.', data: category })
  } catch (err) {
    next(err)
  }
}


const updateCategory = async (req, res, next) => {
  try {
    const data = validate(updateCategorySchema, req.body)
    if (data.name) data.slug = toSlug(data.name)

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    )
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' })
    }
    res.status(200).json({ success: true, message: 'Category updated.', data: category })
  } catch (err) {
    next(err)
  }
}

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id)
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' })
    }
    res.status(200).json({ success: true, message: 'Category deleted.' })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
}