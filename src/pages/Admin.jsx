import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE_URL } from '../lib/api';
import BrandWordmark from '../components/BrandWordmark';

const EMPTY_PRODUCT = {
  name: '',
  category: '',
  price: '',
  oldPrice: '',
  rating: '4.5',
  image: '',
  description: '',
  tag: '',
  brand: 'AYUVEERA',
  short_description: '',
  dosage_form: '',
  pack_size: '',
  key_benefits: '',
  ingredients: '',
  how_to_use: '',
  safety_information: '',
  storage_instructions: '',
  suitable_for: '',
  product_type: '',
  manufacturer: '',
  country_of_origin: 'India',
  shelf_life: '',
  meta_title: '',
  meta_description: '',
  license_number: '',
};
const SECTIONS = [
  { id: 'products', label: 'Products' },
  { id: 'categories', label: 'Categories' },
  { id: 'orders', label: 'Orders' },
  { id: 'customers', label: 'Customers' },
  { id: 'promotions', label: 'Promotions' },
  { id: 'messages', label: 'Messages' },
];
const ORDER_STATUSES = ['pending_payment', 'placed', 'processing', 'shipped', 'delivered', 'cancelled'];

async function adminRequest(resource, token, { method = 'GET', id, phone, body } = {}) {
  const query = new URLSearchParams({ resource });
  if (id !== undefined && id !== null) query.set('id', String(id));
  if (phone !== undefined) query.set('phone', phone);

  const response = await fetch(`${API_BASE_URL}/admin.php?${query}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });
  const result = await response.json().catch(() => null);

  if (response.status === 401) {
    sessionStorage.removeItem('adminToken');
    window.dispatchEvent(new Event('admin-session-expired'));
  }
  if (!response.ok) {
    throw new Error(result?.error || `Request failed with status ${response.status}.`);
  }

  return result?.data;
}

function formatDate(value) {
  return new Date(`${value.replace(' ', 'T')}Z`).toLocaleString();
}

function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem('adminToken') || '');
  const [checking, setChecking] = useState(
    () => Boolean(sessionStorage.getItem('adminToken')) && Boolean(API_BASE_URL),
  );
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [section, setSection] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderPhoneSearch, setOrderPhoneSearch] = useState('');
  const [appliedOrderPhone, setAppliedOrderPhone] = useState('');
  const [customers, setCustomers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [couponPercentDrafts, setCouponPercentDrafts] = useState({});
  const [categoryName, setCategoryName] = useState('');
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountPercent: '10',
    showInBanner: true,
  });
  const [onlineDiscountDraft, setOnlineDiscountDraft] = useState('10');
  const [loading, setLoading] = useState(
    () => Boolean(sessionStorage.getItem('adminToken')),
  );
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [savingProduct, setSavingProduct] = useState(false);
  const [search, setSearch] = useState('');
  const productFormRef = useRef(null);
  const productNameRef = useRef(null);
  const productImagesRef = useRef(null);
  const imagePreviews = useMemo(
    () => imageFiles.map((file) => URL.createObjectURL(file)),
    [imageFiles],
  );

  useEffect(() => () => imagePreviews.forEach((preview) => URL.revokeObjectURL(preview)), [imagePreviews]);

  const signOut = useCallback(() => {
    sessionStorage.removeItem('adminToken');
    setToken('');
    setChecking(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleExpired = () => signOut();
    window.addEventListener('admin-session-expired', handleExpired);
    return () => window.removeEventListener('admin-session-expired', handleExpired);
  }, [signOut]);

  useEffect(() => {
    if (!token || !API_BASE_URL) return undefined;

    fetch(`${API_BASE_URL}/admin-auth.php`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Admin session expired. Please sign in again.');
        return response.json();
      })
      .catch(() => signOut())
      .finally(() => setChecking(false));

    return undefined;
  }, [token, signOut]);

  const loadSection = useCallback((resource = section, phone = '') => (
    token
      ? adminRequest(resource, token, resource === 'orders' && phone ? { phone } : undefined)
      : Promise.resolve(null)
  ), [section, token]);

  const setSectionData = useCallback((resource, data) => {
    if (resource === 'products') setProducts(data);
    if (resource === 'categories') setCategories(data);
    if (resource === 'orders') setOrders(data);
    if (resource === 'customers') setCustomers(data);
    if (resource === 'messages') setMessages(data);
    if (resource === 'promotions') {
      setOnlineDiscountDraft(String(data.onlineDiscountPercent));
      setCoupons(data.coupons || []);
      setCouponPercentDrafts(Object.fromEntries(
        (data.coupons || []).map((coupon) => [coupon.id, String(coupon.discountPercent)]),
      ));
    }
  }, []);

  useEffect(() => {
    if (!token) return undefined;

    let active = true;
    setLoading(true);
    setError('');
    const requests = [loadSection(section, section === 'orders' ? appliedOrderPhone : '')];
    if (section === 'products') requests.push(loadSection('categories'));
    Promise.all(requests)
      .then(([data, categoryData]) => {
        if (!active) return;
        setSectionData(section, data);
        if (categoryData) setCategories(categoryData);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [appliedOrderPhone, loadSection, section, setSectionData, token]);

  async function refreshSection(resource = section) {
    setLoading(true);
    try {
      setSectionData(resource, await loadSection(resource, resource === 'orders' ? appliedOrderPhone : ''));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function searchOrders(event) {
    event.preventDefault();
    setError('');
    setAppliedOrderPhone(orderPhoneSearch.trim());
  }

  function clearOrderSearch() {
    setOrderPhoneSearch('');
    setError('');
    setAppliedOrderPhone('');
  }

  const counts = useMemo(() => ({
    products: products.length,
    activeProducts: products.filter((product) => product.isActive).length,
    orders: orders.length,
    customers: customers.length,
    newMessages: messages.filter((message) => message.status === 'new').length,
  }), [products, orders, customers, messages]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => (
      product.name.toLowerCase().includes(term)
      || product.category.toLowerCase().includes(term)
    ));
  }, [products, search]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError('');
    if (!API_BASE_URL) {
      setLoginError('Backend is not configured. Set VITE_API_BASE_URL and rebuild the app.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/admin-auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || 'Admin sign-in failed.');
      sessionStorage.setItem('adminToken', result.data.token);
      setLoading(true);
      setToken(result.data.token);
      setCredentials({ username: '', password: '' });
    } catch (requestError) {
      setLoginError(requestError.message);
    }
  }

  function startNewProduct() {
    if (savingProduct) return;

    setEditingProduct(null);
    setProductForm({
      ...EMPTY_PRODUCT,
      category: categories.find((category) => category.isActive)?.name || '',
    });
    setImageFiles([]);
    setExistingImages([]);
    if (productImagesRef.current) productImagesRef.current.value = '';
    setError('');
    setNotice('');
    productFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    productNameRef.current?.focus({ preventScroll: true });
  }

  function startEditProduct(product) {
    setEditingProduct(product.id);
    setProductForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      oldPrice: String(product.oldPrice),
      rating: String(product.rating),
      image: product.image,
      description: product.description,
      tag: product.tag || '',
      brand: product.brand || '',
      short_description: product.short_description || '',
      dosage_form: product.dosage_form || '',
      pack_size: product.pack_size || '',
      key_benefits: Array.isArray(product.key_benefits) ? product.key_benefits.join('\n') : '',
      ingredients: (Array.isArray(product.ingredientRows) && product.ingredientRows.length
        ? product.ingredientRows.map((ingredient) => [
          ingredient.name || ingredient.ingredient_name,
          ingredient.quantity,
          ingredient.unit,
        ].filter((value) => value !== null && value !== undefined && value !== '').join(' | '))
        : (Array.isArray(product.ingredients) ? product.ingredients : []).map((name) => String(name)))
        .join('\n'),
      how_to_use: product.how_to_use || '',
      safety_information: product.safety_information || '',
      storage_instructions: product.storage_instructions || '',
      suitable_for: product.suitable_for || '',
      product_type: product.product_type || '',
      manufacturer: product.manufacturer || '',
      country_of_origin: product.country_of_origin || '',
      shelf_life: product.shelf_life || '',
      meta_title: product.meta_title || '',
      meta_description: product.meta_description || '',
      license_number: product.license_number || '',
    });
    setImageFiles([]);
    setExistingImages(product.images?.length ? product.images : [product.image]);
    if (productImagesRef.current) productImagesRef.current.value = '';
    setError('');
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function moveImage(index, direction) {
    setImageFiles((currentFiles) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= currentFiles.length) return currentFiles;

      const reorderedFiles = [...currentFiles];
      [reorderedFiles[index], reorderedFiles[targetIndex]] = [
        reorderedFiles[targetIndex],
        reorderedFiles[index],
      ];
      return reorderedFiles;
    });
  }

  async function saveProduct(event) {
    event.preventDefault();
    const invalidImage = imageFiles.find((file) => (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
      || file.size > 5 * 1024 * 1024
    ));
    if (imageFiles.length > 6 || invalidImage) {
      setError(invalidImage
        ? !['image/jpeg', 'image/png', 'image/webp'].includes(invalidImage.type)
          ? 'Choose JPEG, PNG, or WebP product images only.'
          : 'Each product image must be no larger than 5 MB.'
        : 'Choose no more than 6 product images.');
      return;
    }
    if (!editingProduct && imageFiles.length === 0) {
      setError('Upload at least one product image.');
      return;
    }
    setSavingProduct(true);
    setError('');
    setNotice('');
    try {
      const body = new FormData();
      Object.entries(productForm).forEach(([key, value]) => {
        if (key !== 'image') body.append(key, value);
      });
      imageFiles.forEach((file) => body.append('images[]', file));
      if (editingProduct) body.append('_method', 'PATCH');
      await adminRequest('products', token, {
        method: 'POST',
        id: editingProduct,
        body,
      });
      setProductForm({
        ...EMPTY_PRODUCT,
        category: categories.find((category) => category.isActive)?.name || '',
      });
      setEditingProduct(null);
      setImageFiles([]);
      setExistingImages([]);
      if (productImagesRef.current) productImagesRef.current.value = '';
      setNotice(editingProduct
        ? imageFiles.length > 0 ? 'Product updated and gallery replaced.' : 'Product updated; existing gallery preserved.'
        : 'Product created.');
      await refreshSection('products');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingProduct(false);
    }
  }

  async function toggleProduct(product) {
    setError('');
    setNotice('');
    try {
      await adminRequest('products', token, {
        method: 'PATCH',
        id: product.id,
        body: { isActive: !product.isActive },
      });
      setNotice(`Product ${product.isActive ? 'deactivated' : 'activated'}.`);
      await refreshSection();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function addCategory(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      await adminRequest('categories', token, {
        method: 'POST',
        body: { name: categoryName },
      });
      setCategoryName('');
      setNotice('Category added. Add products to make it visible to customers.');
      await refreshSection('categories');
      await refreshSection('products');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function toggleCategory(category) {
    setError('');
    setNotice('');
    try {
      await adminRequest('categories', token, {
        method: 'PATCH',
        id: category.id,
        body: { isActive: !category.isActive },
      });
      setNotice(`Category ${category.isActive ? 'deactivated' : 'activated'}.`);
      await refreshSection('categories');
      await refreshSection('products');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function saveOnlineDiscount(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      await adminRequest('promotions', token, {
        method: 'PATCH',
        body: { onlineDiscountPercent: Number(onlineDiscountDraft) },
      });
      setNotice('Online payment discount updated.');
      await refreshSection('promotions');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function addCoupon(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      await adminRequest('coupons', token, {
        method: 'POST',
        body: {
          ...couponForm,
          code: couponForm.code.toUpperCase().trim(),
          discountPercent: Number(couponForm.discountPercent),
        },
      });
      setCouponForm({ code: '', discountPercent: '10', showInBanner: true });
      setNotice('Coupon added. It is valid for full online payments only.');
      await refreshSection('promotions');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function updateCoupon(coupon, updates) {
    const isActive = updates.isActive ?? coupon.isActive;
    const showInBanner = isActive ? (updates.showInBanner ?? coupon.showInBanner) : false;
    setError('');
    setNotice('');
    try {
      await adminRequest('coupons', token, {
        method: 'PATCH',
        id: coupon.id,
        body: {
          discountPercent: Number(couponPercentDrafts[coupon.id] ?? coupon.discountPercent),
          isActive,
          showInBanner,
        },
      });
      setNotice('Coupon settings updated.');
      await refreshSection('promotions');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function updateStatus(resource, id, status) {
    setError('');
    setNotice('');
    try {
      await adminRequest(resource, token, { method: 'PATCH', id, body: { status } });
      setNotice(resource === 'orders' ? 'Order status updated.' : 'Message status updated.');
      await refreshSection();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function markCODBalanceReceived(orderId) {
    setError('');
    setNotice('');
    try {
      await adminRequest('orders', token, {
        method: 'PATCH',
        id: orderId,
        body: { markBalanceReceived: true },
      });
      setNotice('COD delivery balance recorded as received.');
      await refreshSection();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (checking) {
    return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] text-sm text-gray-600">Checking admin session...</main>;
  }

  if (!token) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4 py-10">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl border border-[#e4e9df] bg-white p-8 shadow-xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#66814a]">
            <BrandWordmark className="h-4 w-[76px]" /> Store
          </p>
          <h1 className="mt-2 text-3xl font-black text-[#163c2b]">Admin sign in</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">Authorized staff only. Admin credentials are configured on the PHP server.</p>
          <label className="mt-7 block text-sm font-semibold text-gray-700" htmlFor="admin-username">Username</label>
          <input id="admin-username" autoComplete="username" required value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-[#527449]" />
          <label className="mt-4 block text-sm font-semibold text-gray-700" htmlFor="admin-password">Password</label>
          <input id="admin-password" type="password" autoComplete="current-password" required value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-[#527449]" />
          {loginError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{loginError}</p>}
          <button type="submit" className="mt-6 w-full rounded-xl bg-[#163c2b] py-3 font-bold text-white hover:bg-[#27573e]">Sign in</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f6f1] text-[#1d3024]">
      <header className="border-b border-[#e1e7dc] bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#718656]">
              <BrandWordmark className="h-4 w-[76px]" /> Store
            </p>
            <h1 className="text-xl font-black md:text-2xl">Admin dashboard</h1>
          </div>
          <button onClick={signOut} className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50">Sign out</button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-8 md:py-8">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Catalog items', counts.products],
            ['Active products', counts.activeProducts],
            ['Orders loaded', counts.orders],
            ['New messages', counts.newMessages],
          ].map(([label, count]) => (
            <div key={label} className="rounded-2xl border border-[#e2e8de] bg-white p-5">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-1 text-3xl font-black text-[#163c2b]">{count}</p>
            </div>
          ))}
        </section>

        <nav className="mt-7 flex gap-2 overflow-x-auto rounded-2xl border border-[#e2e8de] bg-white p-2" aria-label="Admin sections">
          {SECTIONS.map((item) => (
            <button key={item.id} onClick={() => { setLoading(true); setSection(item.id); setError(''); setNotice(''); }} className={`shrink-0 rounded-xl px-5 py-3 text-sm font-bold ${section === item.id ? 'bg-[#163c2b] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {item.label}
              {item.id === 'messages' && counts.newMessages > 0 ? ` (${counts.newMessages})` : ''}
              {item.id === 'orders' && counts.orders > 0 ? ` (${counts.orders})` : ''}
              {item.id === 'customers' && counts.customers > 0 ? ` (${counts.customers})` : ''}
            </button>
          ))}
        </nav>

        {section !== 'products' && error && <p role="alert" aria-live="assertive" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        {section !== 'products' && notice && <p role="status" aria-live="polite" className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">{notice}</p>}
        {loading && section !== 'products' && <p className="mt-5 text-sm text-gray-500">Loading {section}...</p>}

        {section === 'products' && (
          <section className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="overflow-hidden rounded-2xl border border-[#e2e8de] bg-white">
              <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-black">Product catalog</h2>
                  <p className="text-sm text-gray-500">{products.length} total products</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input aria-label="Search products" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." className="min-w-0 rounded-xl border px-3 py-2 text-sm" />
                  <button type="button" onClick={startNewProduct} disabled={savingProduct} className="shrink-0 rounded-xl bg-[#163c2b] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">Add product</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-[#f8faf6] text-xs uppercase text-gray-500">
                    <tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Visibility</th><th className="p-3">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className={!product.isActive ? 'bg-gray-50 text-gray-500' : ''}>
                        <td className="p-3"><div className="flex items-center gap-3"><img src={product.images?.[0] || product.image} alt="" className="h-12 w-12 rounded-lg bg-gray-100 object-cover" /><div><p className="max-w-[250px] font-bold">{product.name}</p><p className="text-xs text-gray-500">ID {product.id} · {product.images?.length || 1} image{(product.images?.length || 1) === 1 ? '' : 's'}</p></div></div></td>
                        <td className="p-3">{product.category}</td>
                        <td className="p-3 font-semibold">₹{product.price}<p className="text-xs font-normal text-gray-400 line-through">₹{product.oldPrice}</p></td>
                        <td className="p-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{product.isActive ? 'Active' : 'Hidden'}</span></td>
                        <td className="p-3"><div className="flex gap-2"><button onClick={() => startEditProduct(product)} className="rounded-lg border px-3 py-1.5 text-xs font-bold">Edit</button><button onClick={() => toggleProduct(product)} className="rounded-lg border px-3 py-1.5 text-xs font-bold">{product.isActive ? 'Hide' : 'Publish'}</button></div></td>
                      </tr>
                    ))}
                    {!loading && filteredProducts.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">No products found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <form ref={productFormRef} onSubmit={saveProduct} className="scroll-mt-4 rounded-2xl border border-[#e2e8de] bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div><h2 className="text-lg font-black">{editingProduct ? 'Edit product' : 'Add product'}</h2><p className="text-sm text-gray-500">Saved directly to the product catalog.</p></div>
                {editingProduct && <button type="button" onClick={startNewProduct} disabled={savingProduct} className="text-sm font-bold text-gray-500 disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>}
              </div>
              {error && <p role="alert" aria-live="assertive" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
              {notice && <p role="status" aria-live="polite" className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-900">{notice}</p>}
              <fieldset disabled={savingProduct} className="mt-4 grid gap-3">
                <label className="text-xs font-bold text-gray-600">Product name<input ref={productNameRef} required maxLength={255} value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                <label className="text-xs font-bold text-gray-600">Category
                  <select required disabled={categories.every((category) => !category.isActive)} value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} className="mt-1 w-full rounded-lg border bg-white p-2.5 text-sm font-normal">
                    {categories.filter((category) => category.isActive || category.name === productForm.category).map((category) => <option key={category.id} value={category.name} disabled={!category.isActive}>{category.name}{!category.isActive ? ' (inactive)' : ''}</option>)}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-bold text-gray-600">Price (₹)<input type="number" min="0" step="1" required value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                  <label className="text-xs font-bold text-gray-600">MRP (₹)<input type="number" min="0" step="1" required value={productForm.oldPrice} onChange={(event) => setProductForm({ ...productForm, oldPrice: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-bold text-gray-600">Rating<input type="number" min="0" max="5" step="0.1" required value={productForm.rating} onChange={(event) => setProductForm({ ...productForm, rating: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                  <label className="text-xs font-bold text-gray-600">Badge/tag<input maxLength={120} value={productForm.tag} onChange={(event) => setProductForm({ ...productForm, tag: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                </div>
                <div>
                  <label htmlFor="product-gallery" className="text-xs font-bold text-gray-600">Product gallery images (1–6)</label>
                  <input
                    ref={productImagesRef}
                    id="product-gallery"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    required={!editingProduct}
                    onChange={(event) => {
                      const selectedFiles = Array.from(event.target.files || []);
                      if (selectedFiles.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) {
                        event.target.value = '';
                        setImageFiles([]);
                        setError('Choose JPEG, PNG, or WebP product images only.');
                        return;
                      }
                      if (selectedFiles.length > 6) {
                        event.target.value = '';
                        setImageFiles([]);
                        setError('Choose no more than 6 product images.');
                        return;
                      }
                      if (selectedFiles.some((file) => file.size > 5 * 1024 * 1024)) {
                        event.target.value = '';
                        setImageFiles([]);
                        setError('Each product image must be no larger than 5 MB.');
                        return;
                      }
                      setError('');
                      setImageFiles(selectedFiles);
                    }}
                    className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal"
                  />
                  <p className="mt-1 text-xs font-normal text-gray-500">
                    JPEG, PNG, or WebP; up to 5 MB each. {editingProduct
                      ? 'Leave empty to preserve the saved gallery; selecting images replaces it.'
                      : 'Upload at least one image.'}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[#163c2b]" aria-live="polite">
                    {imageFiles.length}/6 images selected
                  </p>
                  {(imageFiles.length > 0 ? imagePreviews : existingImages).length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {(imageFiles.length > 0 ? imagePreviews : existingImages).map((src, index) => (
                        <div key={`${src}-${index}`} className="min-w-0">
                          <img
                            src={src}
                            alt={`Product gallery preview ${index + 1}`}
                            className="aspect-square w-full rounded-lg border bg-gray-50 object-cover"
                          />
                          {imageFiles.length > 0 && (
                            <>
                              <p className="mt-1 truncate text-xs text-gray-600" title={imageFiles[index].name}>
                                {imageFiles[index].name}
                              </p>
                              <p className="mt-1 text-xs font-semibold text-[#163c2b]">
                                Image {index + 1} of {imageFiles.length}
                              </p>
                              <div className="mt-2 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, -1)}
                                  disabled={index === 0}
                                  aria-label={`Move ${imageFiles[index].name} up`}
                                  className="rounded-lg border border-[#d6dfd0] px-2.5 py-1.5 text-xs font-semibold text-[#163c2b] hover:bg-[#f4f6f1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#527449] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  Move up
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, 1)}
                                  disabled={index === imageFiles.length - 1}
                                  aria-label={`Move ${imageFiles[index].name} down`}
                                  className="rounded-lg border border-[#d6dfd0] px-2.5 py-1.5 text-xs font-semibold text-[#163c2b] hover:bg-[#f4f6f1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#527449] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  Move down
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <label className="text-xs font-bold text-gray-600">Brand<input maxLength={100} value={productForm.brand} onChange={(event) => setProductForm({ ...productForm, brand: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                <label className="text-xs font-bold text-gray-600">Short description<textarea maxLength={500} rows="2" value={productForm.short_description} onChange={(event) => setProductForm({ ...productForm, short_description: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                <label className="text-xs font-bold text-gray-600">Description<textarea required maxLength={5000} rows="4" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                <label className="text-xs font-bold text-gray-600">Key benefits <span className="font-normal">(one per line)</span><textarea maxLength={15000} rows="4" value={productForm.key_benefits} onChange={(event) => setProductForm({ ...productForm, key_benefits: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                <label className="text-xs font-bold text-gray-600">Ingredients <span className="font-normal">(one per line: name | amount | unit)</span><textarea maxLength={30000} rows="5" value={productForm.ingredients} onChange={(event) => setProductForm({ ...productForm, ingredients: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                <label className="text-xs font-bold text-gray-600">How to use<textarea maxLength={5000} rows="3" value={productForm.how_to_use} onChange={(event) => setProductForm({ ...productForm, how_to_use: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                <label className="text-xs font-bold text-gray-600">Safety information<textarea maxLength={5000} rows="3" value={productForm.safety_information} onChange={(event) => setProductForm({ ...productForm, safety_information: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                <label className="text-xs font-bold text-gray-600">Storage instructions<textarea maxLength={5000} rows="2" value={productForm.storage_instructions} onChange={(event) => setProductForm({ ...productForm, storage_instructions: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-bold text-gray-600">Dosage form<input maxLength={100} value={productForm.dosage_form} onChange={(event) => setProductForm({ ...productForm, dosage_form: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                  <label className="text-xs font-bold text-gray-600">Pack size<input maxLength={100} value={productForm.pack_size} onChange={(event) => setProductForm({ ...productForm, pack_size: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                  <label className="text-xs font-bold text-gray-600">Product type<input maxLength={150} value={productForm.product_type} onChange={(event) => setProductForm({ ...productForm, product_type: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                  <label className="text-xs font-bold text-gray-600">Suitable for<input maxLength={255} value={productForm.suitable_for} onChange={(event) => setProductForm({ ...productForm, suitable_for: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                  <label className="text-xs font-bold text-gray-600">Manufacturer<input maxLength={255} value={productForm.manufacturer} onChange={(event) => setProductForm({ ...productForm, manufacturer: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                  <label className="text-xs font-bold text-gray-600">Country of origin<input maxLength={100} value={productForm.country_of_origin} onChange={(event) => setProductForm({ ...productForm, country_of_origin: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                  <label className="text-xs font-bold text-gray-600">Shelf life<input maxLength={100} value={productForm.shelf_life} onChange={(event) => setProductForm({ ...productForm, shelf_life: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                  <label className="text-xs font-bold text-gray-600">License number<input maxLength={150} value={productForm.license_number} onChange={(event) => setProductForm({ ...productForm, license_number: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                </div>
                <label className="text-xs font-bold text-gray-600">SEO title<input maxLength={255} value={productForm.meta_title} onChange={(event) => setProductForm({ ...productForm, meta_title: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
                <label className="text-xs font-bold text-gray-600">SEO description<textarea maxLength={5000} rows="2" value={productForm.meta_description} onChange={(event) => setProductForm({ ...productForm, meta_description: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
              </fieldset>
              <button disabled={savingProduct} className="mt-4 w-full rounded-xl bg-[#163c2b] py-3 text-sm font-bold text-white disabled:opacity-60">{savingProduct ? 'Saving...' : editingProduct ? 'Save changes' : 'Create product'}</button>
            </form>
          </section>
        )}

        {section === 'categories' && (
          <section className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.25fr)]">
            <form onSubmit={addCategory} className="rounded-2xl border border-[#e2e8de] bg-white p-5">
              <h2 className="text-lg font-black">Add a category</h2>
              <p className="mt-1 text-sm leading-5 text-gray-500">A category appears on the storefront only when it has active products.</p>
              <label className="mt-4 block text-xs font-bold text-gray-600">Category name
                <input required maxLength={100} value={categoryName} onChange={(event) => setCategoryName(event.target.value)} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" />
              </label>
              <button className="mt-4 w-full rounded-xl bg-[#163c2b] py-3 text-sm font-bold text-white">Create category</button>
            </form>
            <div className="overflow-hidden rounded-2xl border border-[#e2e8de] bg-white">
              <div className="border-b p-4"><h2 className="text-lg font-black">Product categories</h2><p className="text-sm text-gray-500">{categories.length} categories</p></div>
              {categories.length === 0 && !loading && <p className="p-8 text-center text-gray-500">No categories found.</p>}
              <div className="divide-y">
                {categories.map((category) => (
                  <article key={category.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <h3 className="font-bold">{category.name}</h3>
                      <p className="text-xs text-gray-500">/{category.slug} · {category.activeProductCount} active product{category.activeProductCount === 1 ? '' : 's'}</p>
                    </div>
                    <button type="button" onClick={() => toggleCategory(category)} className={`rounded-lg px-3 py-2 text-xs font-bold ${category.isActive ? 'border border-[#163c2b] text-[#163c2b]' : 'bg-[#163c2b] text-white'}`}>
                      {category.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {section === 'customers' && (
          <section className="mt-5 overflow-hidden rounded-2xl border border-[#e2e8de] bg-white">
            <div className="border-b p-4"><h2 className="text-lg font-black">Customers</h2><p className="text-sm text-gray-500">Latest registered customers and their saved delivery details.</p></div>
            {customers.length === 0 && !loading && <p className="p-8 text-center text-gray-500">No customer accounts yet.</p>}
            <div className="divide-y">
              {customers.map((customer) => (
                <article key={customer.id} className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_auto]">
                  <div>
                    <h3 className="font-bold">{customer.firstName} {customer.lastName}</h3>
                    <a href={`tel:${customer.phone}`} className="mt-1 inline-block text-sm text-[#31513e] underline">{customer.phone}</a>
                    <p className="mt-1 text-xs text-gray-500">Member since {formatDate(customer.createdAt)}</p>
                    {customer.addresses.length > 0 && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs font-semibold text-[#31513e]">Saved addresses ({customer.addresses.length})</summary>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {customer.addresses.map((address, index) => (
                            <p key={`${customer.id}-${index}`} className="rounded-lg bg-[#f7f9f5] p-3 text-xs leading-5 text-gray-600">
                              <span className="font-semibold text-gray-800">{address.label} · {address.recipientName}</span><br />
                              {address.address}{address.city ? `, ${address.city}` : ''} · {address.pincode}<br />
                              {address.phone}
                            </p>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                  <div className="text-sm md:text-right">
                    <p><span className="font-bold">{customer.orderCount}</span> order{customer.orderCount === 1 ? '' : 's'}</p>
                    <p className="mt-1 text-gray-600">Paid to date: ₹{customer.totalPaid}</p>
                    {customer.latestOrderAt && <p className="mt-1 text-xs text-gray-500">Latest order: {formatDate(customer.latestOrderAt)}</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {section === 'promotions' && (
          <section className="mt-5 grid items-start gap-5 xl:grid-cols-2">
            <div className="space-y-5">
              <form onSubmit={saveOnlineDiscount} className="rounded-2xl border border-[#e2e8de] bg-white p-5">
                <h2 className="text-lg font-black">Online payment discount</h2>
                <p className="mt-1 text-sm leading-5 text-gray-500">This percentage is applied to the cart subtotal when the customer pays the full amount online.</p>
                <label className="mt-4 block text-xs font-bold text-gray-600">Discount percentage
                  <div className="mt-1 flex items-center gap-2">
                    <input type="number" min="0" max="90" step="1" required value={onlineDiscountDraft} onChange={(event) => setOnlineDiscountDraft(event.target.value)} className="w-28 rounded-lg border p-2.5 text-sm font-normal" />
                    <span className="text-sm font-semibold">%</span>
                  </div>
                </label>
                <button className="mt-4 rounded-xl bg-[#163c2b] px-5 py-3 text-sm font-bold text-white">Save online discount</button>
              </form>
              <form onSubmit={addCoupon} className="rounded-2xl border border-[#e2e8de] bg-white p-5">
                <h2 className="text-lg font-black">Create coupon</h2>
                <p className="mt-1 text-sm leading-5 text-gray-500">Coupons are percentage-based, apply only to full online payments, and stack after the online discount.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-bold text-gray-600">Coupon code
                    <input required minLength={3} maxLength={40} pattern="[A-Za-z0-9][A-Za-z0-9_-]{2,39}" value={couponForm.code} onChange={(event) => setCouponForm({ ...couponForm, code: event.target.value.toUpperCase() })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal uppercase" />
                  </label>
                  <label className="text-xs font-bold text-gray-600">Discount percentage
                    <input type="number" min="1" max="90" step="1" required value={couponForm.discountPercent} onChange={(event) => setCouponForm({ ...couponForm, discountPercent: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" />
                  </label>
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={couponForm.showInBanner} onChange={(event) => setCouponForm({ ...couponForm, showInBanner: event.target.checked })} />
                  Show this coupon in the site offer banner
                </label>
                <button className="mt-4 rounded-xl bg-[#163c2b] px-5 py-3 text-sm font-bold text-white">Add coupon</button>
              </form>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#e2e8de] bg-white">
              <div className="border-b p-4"><h2 className="text-lg font-black">Coupon codes</h2><p className="text-sm text-gray-500">Only active coupons can be applied. One active coupon can appear in the banner at a time.</p></div>
              {coupons.length === 0 && <p className="p-8 text-center text-gray-500">No coupons created yet.</p>}
              <div className="divide-y">
                {coupons.map((coupon) => (
                  <article key={coupon.id} className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div><h3 className="font-black tracking-wide">{coupon.code}</h3><p className="text-xs text-gray-500">Created {formatDate(coupon.createdAt)}</p></div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{coupon.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                      <label className="text-xs font-bold text-gray-600">Discount %
                        <input type="number" min="1" max="90" value={couponPercentDrafts[coupon.id] ?? coupon.discountPercent} onChange={(event) => setCouponPercentDrafts((current) => ({ ...current, [coupon.id]: event.target.value }))} className="mt-1 block w-24 rounded-lg border p-2 text-sm font-normal" />
                      </label>
                      <button type="button" onClick={() => updateCoupon(coupon, {})} className="rounded-lg border px-3 py-2 text-xs font-bold">Save</button>
                      <button type="button" onClick={() => updateCoupon(coupon, { isActive: !coupon.isActive })} className="rounded-lg border px-3 py-2 text-xs font-bold">{coupon.isActive ? 'Deactivate' : 'Activate'}</button>
                      <button type="button" disabled={!coupon.isActive} onClick={() => updateCoupon(coupon, { showInBanner: !coupon.showInBanner })} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40">{coupon.showInBanner ? 'Remove from banner' : 'Feature in banner'}</button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {section === 'orders' && (
          <section className="mt-5 overflow-hidden rounded-2xl border border-[#e2e8de] bg-white">
            <div className="flex flex-col gap-4 border-b p-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-black">{appliedOrderPhone ? `Orders for ${appliedOrderPhone}` : 'Recent orders'}</h2>
                <p className="text-sm text-gray-500">{appliedOrderPhone ? `${orders.length} matching order${orders.length === 1 ? '' : 's'}.` : 'Showing up to 200 latest orders.'}</p>
              </div>
              <form onSubmit={searchOrders} className="flex w-full flex-col gap-2 sm:flex-row md:max-w-xl">
                <label htmlFor="order-phone-search" className="sr-only">Search orders by mobile number</label>
                <input
                  id="order-phone-search"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={orderPhoneSearch}
                  onChange={(event) => setOrderPhoneSearch(event.target.value)}
                  placeholder="Search all orders by mobile number"
                  maxLength={24}
                  required
                  className="min-h-10 min-w-0 flex-1 rounded-lg border px-3 text-sm"
                />
                <button type="submit" disabled={loading} className="min-h-10 rounded-lg bg-[#1e3a2e] px-4 text-sm font-semibold text-white disabled:opacity-60">Search</button>
                {appliedOrderPhone && <button type="button" onClick={clearOrderSearch} disabled={loading} className="min-h-10 rounded-lg border px-4 text-sm font-semibold disabled:opacity-60">Latest orders</button>}
              </form>
            </div>
            {orders.length === 0 && !loading && <p className="p-8 text-center text-gray-500">{appliedOrderPhone ? 'No orders found for this mobile number.' : 'No orders yet.'}</p>}
            <div className="divide-y">
              {orders.map((order) => (
                <article key={order.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><h3 className="font-black">AYU-{String(order.id).padStart(6, '0')}</h3><span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span></div>
                    <p className="mt-1 font-semibold">{order.customerName} · {order.phone}</p>
                    <p className="text-sm text-gray-600">{order.address}{order.city ? `, ${order.city}` : ''} · {order.pincode}</p>
                    <p className="mt-1 text-sm text-gray-600">Payment: {order.payment === 'RAZORPAY' ? 'Online payment' : order.paymentStatus === 'partially_paid' || order.status === 'pending_payment' ? 'COD · online advance' : 'Cash on Delivery'} · {order.paymentStatus}</p>
                    {order.onlineDiscount > 0 && <p className="text-sm text-green-700">Online discount: −₹{order.onlineDiscount}</p>}
                    {order.couponDiscount > 0 && <p className="text-sm text-green-700">Coupon {order.couponCode ? `(${order.couponCode}) ` : ''}discount: −₹{order.couponDiscount}</p>}
                    {order.paidAmount > 0 && <p className="text-sm text-gray-600">{order.payment === 'COD' ? 'Paid so far' : 'Paid online'}: ₹{order.paidAmount}</p>}
                    {order.payment === 'COD' && order.amountDue > 0 && <p className="text-sm font-semibold text-gray-700">Due on delivery: ₹{order.amountDue}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">{order.items.map((item, index) => <span key={`${order.id}-${index}`} className="rounded-lg bg-[#f4f6f1] px-2.5 py-1 text-xs">{item.name} × {item.quantity} · ₹{item.price * item.quantity}</span>)}</div>
                  </div>
                  <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end">
                    <p className="text-lg font-black">₹{order.total}</p>
                    <select aria-label={`Order ${order.id} status`} value={order.status} onChange={(event) => updateStatus('orders', order.id, event.target.value)} className="rounded-lg border p-2 text-sm font-semibold">
                      {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                    {order.payment === 'COD' && order.paymentStatus === 'partially_paid' && (
                      <button
                        type="button"
                        onClick={() => markCODBalanceReceived(order.id)}
                        className="rounded-lg border border-[#1e3a2e] px-3 py-2 text-xs font-semibold text-[#1e3a2e]"
                      >
                        Mark delivery balance received
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {section === 'messages' && (
          <section className="mt-5 overflow-hidden rounded-2xl border border-[#e2e8de] bg-white">
            <div className="border-b p-4"><h2 className="text-lg font-black">Contact messages</h2><p className="text-sm text-gray-500">Latest 200 customer messages.</p></div>
            {messages.length === 0 && !loading && <p className="p-8 text-center text-gray-500">No contact messages yet.</p>}
            <div className="divide-y">
              {messages.map((message) => (
                <article key={message.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{message.subject}</h3><span className="text-xs text-gray-500">{formatDate(message.createdAt)}</span></div>
                    <p className="mt-1 text-sm text-gray-600">{message.name} · <a className="underline" href={`mailto:${message.email}`}>{message.email}</a>{message.phone && <> · <a className="underline" href={`tel:${message.phone}`}>{message.phone}</a></>}</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">{message.message}</p>
                  </div>
                  <select aria-label={`Message ${message.id} status`} value={message.status} onChange={(event) => updateStatus('messages', message.id, event.target.value)} className="h-fit rounded-lg border p-2 text-sm font-semibold">
                    <option value="new">New</option><option value="read">Read</option><option value="resolved">Resolved</option>
                  </select>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default Admin;
