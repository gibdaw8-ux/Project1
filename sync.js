/**
 * Fasr Orders — Kitchen & Bar
 * Real-Time Sync Engine (BroadcastChannel + LocalStorage + MQTT WebSocket fallback)
 */

const STORAGE_KEYS = {
  MENU: 'fasr_menu_v1',
  ORDERS: 'fasr_orders_v1',
  REVIEWS: 'fasr_reviews_v1',
  CASHIER_AUTH: 'fasr_cashier_auth_v1',
  ACTIVE_CUSTOMER_ORDER: 'fasr_active_order_id',
  STAFF: 'fasr_staff_members_v1',
  ACTIVE_STAFF: 'fasr_active_staff_id_v1'
};

// Default Staff Roster with multiple cashiers & roles
const DEFAULT_STAFF = [
  {
    id: 'staff-1',
    name: 'Courtney Henry',
    username: 'cashier1',
    pin: '1111',
    role: 'Head Cashier',
    terminal: 'Terminal 01',
    status: 'active', // 'active' | 'suspended'
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'staff-2',
    name: 'Abebe Kebede',
    username: 'cashier2',
    pin: '2222',
    role: 'Cashier / Barista',
    terminal: 'Bar Terminal',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'staff-3',
    name: 'Selamawit Tadesse',
    username: 'cashier3',
    pin: '3333',
    role: 'Cashier / Server',
    terminal: 'Floor Handheld',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'staff-4',
    name: 'Yonas Haile',
    username: 'chef1',
    pin: '4444',
    role: 'Kitchen Lead',
    terminal: 'Kitchen KDS',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  }
];

// Initial Menu in Ethiopian Birr (Br)
const DEFAULT_MENU = [
  {
    id: 'dish-1',
    name: 'Special Tibs',
    category: 'lunch',
    price: 480,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
    description: 'Sautéed prime beef cubes with rosemary, onions, jalapeños, and spiced butter, served with fresh Injera.',
    inStock: true
  },
  {
    id: 'dish-2',
    name: 'Doro Wat Special',
    category: 'dinner',
    price: 550,
    image: 'https://images.unsplash.com/photo-1583032015879-633b4974fbf4?w=500&auto=format&fit=crop&q=80',
    description: 'Slow-simmered chicken drumstick in rich berbere gravy, hard-boiled egg, and homemade Ayib cottage cheese.',
    inStock: true
  },
  {
    id: 'dish-3',
    name: 'Shiro Tegabino',
    category: 'lunch',
    price: 260,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&auto=format&fit=crop&q=80',
    description: 'Simmering clay pot of spiced chickpea flour stew, garlic, and green chilies. 100% Vegan & aromatic.',
    inStock: true
  },
  {
    id: 'dish-4',
    name: 'Kitfo Special',
    category: 'dinner',
    price: 520,
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=500&auto=format&fit=crop&q=80',
    description: 'Finely minced lean beef warmed with niter kibbeh spiced butter & mitmita, served with Gomen and Kocho.',
    inStock: true
  },
  {
    id: 'dish-5',
    name: 'Pasta Bolognese',
    category: 'lunch',
    price: 320,
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d62817ee?w=500&auto=format&fit=crop&q=80',
    description: 'Artisanal beef ragu with fresh taglierini pasta, herbs, and aged parmesan shavings.',
    inStock: true
  },
  {
    id: 'dish-6',
    name: 'Spicy Fried Chicken',
    category: 'fast_food',
    price: 360,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
    description: 'Crispy double-dredged chicken thigh with spicy berbere honey dip and golden fries.',
    inStock: true
  },
  {
    id: 'dish-7',
    name: 'Asa Tibs (Fish Cutlet)',
    category: 'lunch',
    price: 340,
    image: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=500&auto=format&fit=crop&q=80',
    description: 'Crispy golden Lake Tana fish cutlets with fresh lemon tartar dip and rustic chips.',
    inStock: true
  },
  {
    id: 'dish-8',
    name: 'Wagyu Beef Smash Burger',
    category: 'fast_food',
    price: 390,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    description: 'Double smashed beef patties, melted cheddar, crispy onion rings, house special secret sauce.',
    inStock: true
  },
  {
    id: 'dish-9',
    name: 'Tej Honey Wine (Carafe)',
    category: 'beverages',
    price: 180,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&auto=format&fit=crop&q=80',
    description: 'Traditional fermented Ethiopian golden honey mead, served chilled in a glass berele.',
    inStock: true
  },
  {
    id: 'dish-10',
    name: 'Ethiopian Coffee Macchiato',
    category: 'beverages',
    price: 85,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
    description: 'Single-origin roasted Yirgacheffe espresso with velvety steamed whole milk layer.',
    inStock: true
  },
  {
    id: 'dish-11',
    name: 'Fresh Spris Juice',
    category: 'beverages',
    price: 130,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
    description: 'Layered fresh avocado, mango, and papaya puree with fresh lime wedge.',
    inStock: true
  },
  {
    id: 'dish-12',
    name: 'Chocolate Lava Cake',
    category: 'dessert',
    price: 210,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
    description: 'Molten dark chocolate fondant cake with warm molten center and vanilla ice cream.',
    inStock: true
  }
];

const DEFAULT_ORDERS = [
  {
    id: 'ord-101',
    ticketNumber: '#FASR-101',
    tableNumber: 'Table 4',
    customerName: 'Yared M.',
    items: [
      { name: 'Special Tibs', price: 480, quantity: 1 },
      { name: 'Fresh Spris Juice', price: 130, quantity: 2 }
    ],
    subtotal: 740,
    tax: 74,
    total: 814,
    status: 'kitchen',
    createdAt: new Date(Date.now() - 12 * 60000).toISOString()
  },
  {
    id: 'ord-102',
    ticketNumber: '#FASR-102',
    tableNumber: 'Table 2',
    customerName: 'Selam W.',
    items: [
      { name: 'Doro Wat Special', price: 550, quantity: 1 },
      { name: 'Tej Honey Wine (Carafe)', price: 180, quantity: 1 }
    ],
    subtotal: 730,
    tax: 73,
    total: 803,
    status: 'ready',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString()
  },
  {
    id: 'ord-103',
    ticketNumber: '#FASR-103',
    tableNumber: 'Table 7',
    customerName: 'Dawit B.',
    items: [
      { name: 'Kitfo Special', price: 520, quantity: 2 },
      { name: 'Ethiopian Coffee Macchiato', price: 85, quantity: 2 }
    ],
    subtotal: 1210,
    tax: 121,
    total: 1331,
    status: 'served',
    createdAt: new Date(Date.now() - 48 * 60000).toISOString()
  }
];

const DEFAULT_REVIEWS = [
  // TODAY'S REVIEWS
  {
    id: 'rev-today-1',
    orderNumber: '#FASR-105',
    tableNumber: 'Table 3',
    customerName: 'Abebe Kebede',
    rating: 1,
    comment: 'Doro Wat arrived lukewarm and we had to ask three times for injera. Service was quite slow during lunch peak.',
    timestamp: new Date(Date.now() - 40 * 60000).toISOString()
  },
  {
    id: 'rev-today-2',
    orderNumber: '#FASR-104',
    tableNumber: 'Table 5',
    customerName: 'Rahel Mengistu',
    rating: 2,
    comment: 'The French fries were oversalted and cold. Macchiato was delayed by 20 minutes.',
    timestamp: new Date(Date.now() - 100 * 60000).toISOString()
  },
  {
    id: 'rev-today-3',
    orderNumber: '#FASR-102',
    tableNumber: 'Table 2',
    customerName: 'Selam Wondimu',
    rating: 4,
    comment: 'Tej honey wine carafe was delicious and crisp. Table QR ordering made checkout smooth.',
    timestamp: new Date(Date.now() - 160 * 60000).toISOString()
  },
  {
    id: 'rev-today-4',
    orderNumber: '#FASR-103',
    tableNumber: 'Table 7',
    customerName: 'Dawit Berhanu',
    rating: 5,
    comment: 'Authentic Kitfo cooked to perfection! Quick service and pleasant ambiance.',
    timestamp: new Date(Date.now() - 220 * 60000).toISOString()
  },

  // YESTERDAY'S REVIEWS (26 to 34 hours ago)
  {
    id: 'rev-yest-1',
    orderNumber: '#FASR-092',
    tableNumber: 'Table 4',
    customerName: 'Yonas Tadesse',
    rating: 1,
    comment: 'Waited over 40 minutes for Shiro Tegabino. Cashier was unhelpful when we asked for an update.',
    timestamp: new Date(Date.now() - 26 * 3600000).toISOString()
  },
  {
    id: 'rev-yest-2',
    orderNumber: '#FASR-095',
    tableNumber: 'Table 6',
    customerName: 'Hanna Girma',
    rating: 3,
    comment: 'Food was delicious, but music near the counter was too loud for comfortable conversation.',
    timestamp: new Date(Date.now() - 29 * 3600000).toISOString()
  },
  {
    id: 'rev-yest-3',
    orderNumber: '#FASR-098',
    tableNumber: 'Table 1',
    customerName: 'Bethlehem Tefera',
    rating: 5,
    comment: 'The Spris juice is so fresh and the macchiato is top tier. Our favorite restaurant in Addis!',
    timestamp: new Date(Date.now() - 33 * 3600000).toISOString()
  },

  // 2 DAYS AGO (50 to 55 hours ago)
  {
    id: 'rev-past-1',
    orderNumber: '#FASR-082',
    tableNumber: 'Table 8',
    customerName: 'Kidus Fikadu',
    rating: 2,
    comment: 'Beef Tibs were a bit tough and chewy today. Portion size felt smaller than our last visit.',
    timestamp: new Date(Date.now() - 50 * 3600000).toISOString()
  },
  {
    id: 'rev-past-2',
    orderNumber: '#FASR-086',
    tableNumber: 'Table 2',
    customerName: 'Tsedey Assefa',
    rating: 5,
    comment: 'Asa Tibs fish cutlet was golden crispy and piping hot! Telebirr payment was smooth.',
    timestamp: new Date(Date.now() - 54 * 3600000).toISOString()
  }
];

const DEFAULT_AUTH = {
  isLocked: true,
  isManagerLocked: true,
  pin: '1111',
  username: 'cashier1',
  lastUnlockedAt: null
};

class FasrSyncEngine {
  constructor() {
    this.broadcastChannel = null;
    this.listeners = [];
    this.mqttClient = null;
    this.initStorage();
    this.initBroadcastChannel();
    this.initMqtt();
    this.initStorageListener();
  }

  initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.MENU)) {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_MENU));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
    }
    const storedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (!storedReviews || (JSON.parse(storedReviews || '[]')).length <= 2) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(DEFAULT_REVIEWS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CASHIER_AUTH)) {
      localStorage.setItem(STORAGE_KEYS.CASHIER_AUTH, JSON.stringify(DEFAULT_AUTH));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STAFF)) {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(DEFAULT_STAFF));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_STAFF)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_STAFF, 'staff-1');
    }
  }

  initBroadcastChannel() {
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        this.broadcastChannel = new BroadcastChannel('fasr_orders_channel');
        this.broadcastChannel.onmessage = (event) => {
          this.handleInboundEvent(event.data);
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
    }
  }

  initStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (Object.values(STORAGE_KEYS).includes(e.key)) {
          this.emitLocalChange(e.key);
        }
      });
    }
  }

  initMqtt() {
    if (typeof window !== 'undefined' && window.mqtt) {
      try {
        const brokerUrl = 'wss://broker.emqx.io:8084/mqtt';
        const clientId = 'fasr_' + Math.random().toString(16).substring(2, 10);
        this.mqttClient = window.mqtt.connect(brokerUrl, {
          clientId,
          clean: true,
          connectTimeout: 5000,
          reconnectPeriod: 3000
        });

        this.mqttClient.on('connect', () => {
          this.mqttClient.subscribe('fasr_pos_stream/#', (err) => {
            if (!err) console.log('MQTT sync connected');
          });
        });

        this.mqttClient.on('message', (topic, message) => {
          try {
            const data = JSON.parse(message.toString());
            if (data._sender !== clientId) {
              this.handleInboundEvent(data, true);
            }
          } catch (e) {}
        });
      } catch (e) {
        console.warn('MQTT init failed, local sync active:', e);
      }
    }
  }

  publish(type, payload = {}) {
    const event = {
      type,
      payload,
      timestamp: Date.now(),
      _sender: this.mqttClient ? this.mqttClient.options.clientId : 'local'
    };

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(event);
    }

    if (this.mqttClient && this.mqttClient.connected) {
      try {
        this.mqttClient.publish('fasr_pos_stream/events', JSON.stringify(event));
      } catch (e) {}
    }

    this.notifyListeners(event);
  }

  handleInboundEvent(event, fromMqtt = false) {
    if (!event || !event.type) return;

    switch (event.type) {
      case 'ORDER_CREATED': {
        const orders = this.getOrders();
        const exists = orders.some(o => o.id === event.payload.id);
        if (!exists) {
          orders.unshift(event.payload);
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        }
        break;
      }
      case 'ORDER_STATUS_CHANGED': {
        const orders = this.getOrders();
        const target = orders.find(o => o.id === event.payload.orderId);
        if (target) {
          target.status = event.payload.status;
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        }
        break;
      }
      case 'CASHIER_AUTH_CHANGED': {
        localStorage.setItem(STORAGE_KEYS.CASHIER_AUTH, JSON.stringify(event.payload));
        break;
      }
      case 'STAFF_CHANGED': {
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(event.payload));
        break;
      }
      case 'ACTIVE_STAFF_CHANGED': {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_STAFF, event.payload);
        break;
      }
      case 'MENU_CHANGED': {
        localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(event.payload));
        break;
      }
      case 'REVIEW_CREATED': {
        const reviews = this.getReviews();
        const exists = reviews.some(r => r.id === event.payload.id || (
          r.orderNumber === event.payload.orderNumber &&
          r.comment === event.payload.comment &&
          Math.abs(new Date(r.timestamp).getTime() - new Date(event.payload.timestamp).getTime()) < 10000
        ));
        if (!exists) {
          reviews.unshift(event.payload);
          localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
        }
        break;
      }
    }

    this.notifyListeners(event);
  }

  emitLocalChange(key) {
    this.notifyListeners({ type: 'STORAGE_SYNC', key });
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(event) {
    this.listeners.forEach(cb => {
      try {
        cb(event);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  // Data Getters
  getMenu() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MENU)) || DEFAULT_MENU;
    } catch {
      return DEFAULT_MENU;
    }
  }

  getOrders() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || DEFAULT_ORDERS;
    } catch {
      return DEFAULT_ORDERS;
    }
  }

  getReviews() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      let list = [];
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 2) {
          list = parsed;
        }
      }
      if (list.length === 0) {
        list = [...DEFAULT_REVIEWS];
      }

      // Deduplicate by ID and unique signature
      const seenIds = new Set();
      const deduped = [];
      for (const r of list) {
        if (!r || !r.id) continue;
        const sig = `${r.orderNumber}_${r.comment}_${r.rating}`;
        if (!seenIds.has(r.id) && !seenIds.has(sig)) {
          seenIds.add(r.id);
          seenIds.add(sig);
          deduped.push(r);
        }
      }

      if (deduped.length !== list.length) {
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(deduped));
      }
      return deduped;
    } catch {
      return DEFAULT_REVIEWS;
    }
  }

  getCashierAuth() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CASHIER_AUTH)) || DEFAULT_AUTH;
    } catch {
      return DEFAULT_AUTH;
    }
  }

  // ==========================================
  // MULTI-STAFF & CASHIER MANAGEMENT APIS
  // ==========================================
  getStaffList() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.STAFF)) || DEFAULT_STAFF;
    } catch {
      return DEFAULT_STAFF;
    }
  }

  saveStaffList(staffList) {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
    this.publish('STAFF_CHANGED', staffList);
  }

  addStaffMember(staffData) {
    const list = this.getStaffList();
    const newStaff = {
      id: `staff-${Date.now()}`,
      name: staffData.name,
      username: staffData.username || `cashier${list.length + 1}`,
      pin: staffData.pin || '1234',
      role: staffData.role || 'Cashier',
      terminal: staffData.terminal || 'Terminal 01',
      status: 'active',
      avatar: staffData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    };
    list.push(newStaff);
    this.saveStaffList(list);
    return newStaff;
  }

  updateStaffMember(id, updatedFields) {
    const list = this.getStaffList();
    const target = list.find(s => s.id === id);
    if (target) {
      Object.assign(target, updatedFields);
      this.saveStaffList(list);
      return target;
    }
    return null;
  }

  deleteStaffMember(id) {
    const list = this.getStaffList();
    const filtered = list.filter(s => s.id !== id);
    this.saveStaffList(filtered);
  }

  toggleStaffStatus(id) {
    const list = this.getStaffList();
    const target = list.find(s => s.id === id);
    if (target) {
      target.status = target.status === 'active' ? 'suspended' : 'active';
      this.saveStaffList(list);
      return target;
    }
    return null;
  }

  findStaffByPin(pin) {
    const list = this.getStaffList();
    // Return matching active staff
    const found = list.find(s => s.pin === pin && s.status === 'active');
    if (found) return found;

    // Fallback to primary auth pin
    const auth = this.getCashierAuth();
    if (auth.pin === pin) {
      return list[0] || { id: 'staff-1', name: 'Courtney Henry', role: 'Cashier', username: 'cashier1' };
    }
    return null;
  }

  getActiveStaff() {
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_STAFF) || 'staff-1';
    const list = this.getStaffList();
    return list.find(s => s.id === activeId) || list[0] || DEFAULT_STAFF[0];
  }

  setActiveStaff(staffId) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_STAFF, staffId);
    this.publish('ACTIVE_STAFF_CHANGED', staffId);
  }

  // Data Setters / Mutators
  saveMenu(newMenu) {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(newMenu));
    this.publish('MENU_CHANGED', newMenu);
  }

  createOrder(orderData) {
    const orders = this.getOrders();
    const newOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      ticketNumber: `#FASR-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.publish('ORDER_CREATED', newOrder);
    return newOrder;
  }

  updateOrderStatus(orderId, status) {
    const orders = this.getOrders();
    const target = orders.find(o => o.id === orderId);
    if (target) {
      target.status = status;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      this.publish('ORDER_STATUS_CHANGED', { orderId, status });
    }
  }

  setManagerLock(isLocked) {
    const auth = this.getCashierAuth();
    auth.isLocked = isLocked;
    auth.isManagerLocked = isLocked;
    if (!isLocked) auth.lastUnlockedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.CASHIER_AUTH, JSON.stringify(auth));
    this.publish('CASHIER_AUTH_CHANGED', auth);
  }

  setCashierLock(isLocked, isManagerOverride = false) {
    const auth = this.getCashierAuth();
    auth.isLocked = isLocked;
    if (isManagerOverride) {
      auth.isManagerLocked = isLocked;
    } else if (!isLocked) {
      auth.isManagerLocked = false;
    }
    if (!isLocked) auth.lastUnlockedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.CASHIER_AUTH, JSON.stringify(auth));
    this.publish('CASHIER_AUTH_CHANGED', auth);
  }

  setCashierPin(newPin) {
    const auth = this.getCashierAuth();
    auth.pin = newPin;
    localStorage.setItem(STORAGE_KEYS.CASHIER_AUTH, JSON.stringify(auth));
    this.publish('CASHIER_AUTH_CHANGED', auth);

    // Also update default staff-1 pin
    const list = this.getStaffList();
    if (list[0]) {
      list[0].pin = newPin;
      this.saveStaffList(list);
    }
  }

  createReview(reviewData) {
    const reviews = this.getReviews();
    const newReview = {
      ...reviewData,
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };

    // Prevent duplicate submission
    const alreadyExists = reviews.some(r => 
      r.orderNumber === newReview.orderNumber &&
      r.comment === newReview.comment &&
      Math.abs(new Date(r.timestamp).getTime() - new Date(newReview.timestamp).getTime()) < 10000
    );

    if (!alreadyExists) {
      reviews.unshift(newReview);
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
      this.publish('REVIEW_CREATED', newReview);
    }
    return newReview;
  }
}

// Audio synthesizer for alarms and notifications
class SoundFx {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {}
  }

  playReadyAlarm() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [587.33, 739.99, 880.00, 1174.66, 880.00, 1174.66];
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.3);
      });
    } catch (e) {}
  }

  playCashierDing() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1320, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.42);
    } catch (e) {}
  }
}

// Global UI helper for Toast and In-Page Modal
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgClasses = type === 'success' 
    ? 'bg-emerald-600 text-white' 
    : type === 'error' 
      ? 'bg-rose-600 text-white' 
      : type === 'warning'
        ? 'bg-amber-600 text-white'
        : 'bg-slate-900 text-white dark:bg-slate-800 dark:border dark:border-slate-700';

  toast.className = `${bgClasses} pointer-events-auto p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs font-bold transition-all transform duration-300 translate-y-[-10px] opacity-0`;
  
  toast.innerHTML = `
    <div class="flex items-center gap-2.5">
      <span>${message}</span>
    </div>
    <button class="text-white/70 hover:text-white p-1" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-[-10px]', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'scale-95');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function showInPageModal({ title, content, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) {
  const modalWrapper = document.createElement('div');
  modalWrapper.className = 'fixed inset-0 bg-black/60 backdrop-blur-xs z-[99998] flex items-center justify-center p-4 transition-opacity';
  
  modalWrapper.innerHTML = `
    <div class="bg-white dark:bg-slate-900 dark:text-white dark:border dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 transform transition-transform scale-95 animate-in">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 class="text-base font-extrabold text-slate-900 dark:text-white">${title}</h3>
        <button class="modal-close text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
      </div>
      <div class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed modal-content">
        ${content}
      </div>
      <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
        ${cancelText ? `<button class="modal-cancel px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">${cancelText}</button>` : ''}
        <button class="modal-confirm px-4 py-2.5 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-sm">${confirmText}</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalWrapper);

  const close = () => {
    modalWrapper.remove();
  };

  modalWrapper.querySelector('.modal-close').onclick = () => {
    if (onCancel) onCancel();
    close();
  };

  const cancelBtn = modalWrapper.querySelector('.modal-cancel');
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      if (onCancel) onCancel();
      close();
    };
  }

  modalWrapper.querySelector('.modal-confirm').onclick = () => {
    if (onConfirm) onConfirm();
    close();
  };
}

// Global instance export
window.fasrSync = new FasrSyncEngine();
window.fasrSound = new SoundFx();
window.showToast = showToast;
window.showInPageModal = showInPageModal;
