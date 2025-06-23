import express from 'express';
import bookingRequestSchema from '../../schema/request.js'; // adjust path as needed

const router = express.Router();

// Send booking request
router.post('/book', async (req, res) => {
    try {
      const { userId, location, role } = req.body;
  
      // Validation (optional but recommended)
      if (!userId || !location || !location.coordinates || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      const request = new bookingRequestSchema({
        userId,
        location,
        role
      });
  
      await request.save();
  
      res.status(201).json({ message: 'Request sent successfully', request });
  
    } catch (err) {
      console.error('Error sending booking request:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
// Mechanic accepts request
router.put('/book/:id/accept', async (req, res) => {
  const { id } = req.params;
  const {status}=req.body;

  const request = await bookingRequestSchema.findByIdAndUpdate(id, { status: status }, { new: true });
  res.json({ message: 'Request accepted', request });
});

// Get requests for a mechanic
router.get('/mechanic/requests', async (req, res) => {
    try {
      const requests = await bookingRequestSchema.find({
        status: 'pending',
        role: 'mechanic'
      }).populate('userId');
  
      res.json(requests);
    } catch (error) {
      console.error('Error fetching mechanic requests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  router.get('/requests', async (req, res) => {
    try {
      const requests = await bookingRequestSchema.find().populate('userId');
  
      res.json(requests);
    } catch (error) {
      console.error('Error fetching mechanic requests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
export default router;
