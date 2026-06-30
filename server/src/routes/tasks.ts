import { Router } from 'express';
import { supabase } from '../supabaseClient';

const router = Router();

// Get all tasks with their sprints
router.get('/', async (req, res) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*, sprints(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Update task
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Update sprint step
router.patch('/sprints/:sprintId', async (req, res) => {
  try {
    const { sprintId } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('sprints')
      .update(updates)
      .eq('id', sprintId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update sprint' });
  }
});

export default router;
