import { motion } from "framer-motion";
import { StatCard } from "@/components/dashboard/StatCard";
import { Package, Bot, ShoppingCart, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const fastMoving = [
  { name: 'Widget Pro X1', picks: 142 },
  { name: 'Bearing Set 6205', picks: 118 },
  { name: 'LED Panel Strip', picks: 97 },
  { name: 'Motor Assembly K7', picks: 83 },
  { name: 'Sensor Module V3', picks: 65 },
];

const categoryData = [
  { name: 'Electronics', value: 35, color: 'hsl(190,95%,50%)' },
  { name: 'Mechanical', value: 25, color: 'hsl(145,65%,42%)' },
  { name: 'Motors', value: 20, color: 'hsl(40,90%,50%)' },
  { name: 'Other', value: 20, color: 'hsl(220,10%,50%)' },
];

const efficiency = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  value: 88 + Math.random() * 10,
}));

export default function Analytics() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Performance insights & trends</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total SKUs" value="289" change="+8 this week" changeType="positive" icon={Package} />
        <StatCard title="Picks Today" value="847" change="+15%" changeType="positive" icon={TrendingUp} />
        <StatCard title="Fleet Uptime" value="96.8%" change="-0.2%" changeType="negative" icon={Bot} />
        <StatCard title="Order Accuracy" value="99.4%" change="+0.1%" changeType="positive" icon={ShoppingCart} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Fast-Moving Items</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={fastMoving} layout="vertical">
              <XAxis type="number" tick={{ fill: 'hsl(220,10%,50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(220,10%,50%)', fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip contentStyle={{ background: 'hsl(222,22%,9%)', border: '1px solid hsl(222,20%,16%)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              <Bar dataKey="picks" fill="hsl(190,95%,50%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="stat-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Inventory by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(222,22%,9%)', border: '1px solid hsl(222,20%,16%)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {categoryData.map(c => (
              <div key={c.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c.color }} />
                <span className="text-[11px] text-muted-foreground">{c.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Efficiency</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={efficiency}>
            <XAxis dataKey="day" tick={{ fill: 'hsl(220,10%,50%)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={[85, 100]} tick={{ fill: 'hsl(220,10%,50%)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'hsl(222,22%,9%)', border: '1px solid hsl(222,20%,16%)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
            <Line type="monotone" dataKey="value" stroke="hsl(190,95%,50%)" strokeWidth={2} dot={{ fill: 'hsl(190,95%,50%)', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
