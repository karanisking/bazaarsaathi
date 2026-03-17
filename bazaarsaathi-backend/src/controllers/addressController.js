const Address = require('../models/address');

const { validate, addressSchema, updateAddressSchema } = require('../utils/validator')


const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.status(200).json({ success: true, message: 'Addresses fetched.', data: addresses })
  } catch (err) {
    next(err)
  }
}


const addAddress = async (req, res, next) => {
  try {
    const data = validate(addressSchema, req.body)
    const address = await Address.create({ user: req.user.id, ...data })
    res.status(201).json({ success: true, message: 'Address added.', data: address })
  } catch (err) {
    next(err)
  }
}


const updateAddress = async (req, res, next) => {
  try {
    const data = validate(updateAddressSchema, req.body)
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      data,
      { new: true, runValidators: true }
    )
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found.' })
    }
    res.status(200).json({ success: true, message: 'Address updated.', data: address })
  } catch (err) {
    next(err)
  }
}


const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    })
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found.' })
    }
    res.status(200).json({ success: true, message: 'Address deleted.' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress }