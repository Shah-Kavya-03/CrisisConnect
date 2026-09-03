import Organization from '../models/Organization.js';

// @desc    Register a new emergency response organization / NGO
// @route   POST /api/organizations
// @access  Public
export const registerOrganization = async (req, res, next) => {
  try {
    const { name, registrationNumber, type, contactEmail, contactPhone, jurisdictionCity, resourcesInventory } = req.body;

    const existing = await Organization.findOne({
      $or: [{ name }, { registrationNumber }]
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Organization already registered with this name or registration number' });
    }

    const org = await Organization.create({
      name,
      registrationNumber,
      type: type || 'Registered NGO',
      contactEmail,
      contactPhone,
      jurisdictionCity: jurisdictionCity || 'National Capital Region',
      resourcesInventory: resourcesInventory || {
        oxygenCylinders: 20,
        foodKits: 400,
        drinkingWaterLiters: 1500,
        temporaryShelterBeds: 50,
        rescueBoats: 3,
        medicalFirstAidKits: 100
      }
    });

    res.status(201).json({
      success: true,
      organization: org
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of verified relief organizations
// @route   GET /api/organizations
// @access  Public
export const getOrganizations = async (req, res, next) => {
  try {
    const orgs = await Organization.find({ isVerified: true });
    res.json({
      success: true,
      count: orgs.length,
      organizations: orgs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource inventory counts
// @route   PATCH /api/organizations/:id/inventory
// @access  Private (NGO / Admin)
export const updateInventory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resourcesInventory } = req.body;

    const org = await Organization.findById(id);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    org.resourcesInventory = { ...org.resourcesInventory, ...resourcesInventory };
    await org.save();

    res.json({
      success: true,
      organization: org
    });
  } catch (error) {
    next(error);
  }
};
