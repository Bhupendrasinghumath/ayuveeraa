import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE_URL } from '../lib/api';
import { categories as productCategories } from '../data/categories';

const EMPTY_PRODUCT = {
  name: '',
  category: 'Weight Management',
  price: '',
  oldPrice: '',
  rating: '4.5',
  image: '',
  description: '',
  tag: '',
};
const SECTIONS = [
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders' },
  { id: 'messages', label: 'Messages' },
];
const ORDER_STATUSES = ['pending_payment', 'placed', 'processing', 'shipped', 'delivered', 'cancelled'];

async function adminRequest(resource, token, { method = 'GET', id, body } = {}) {
  const query = new URLSearchParams({ resource });
  if (id !== undefined && id !== null) query.set('id', String(id));

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
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
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

  const loadSection = useCallback((resource = section) => (
    token ? adminRequest(resource, token) : Promise.resolve(null)
  ), [section, token]);

  const setSectionData = useCallback((resource, data) => {
    if (resource === 'products') setProducts(data);
    if (resource === 'orders') setOrders(data);
    if (resource === 'messages') setMessages(data);
  }, []);

  useEffect(() => {
    if (!token) return undefined;

    let active = true;
    loadSection(section)
      .then((data) => {
        if (active) setSectionData(section, data);
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
  }, [loadSection, section, setSectionData, token]);

  async function refreshSection(resource = section) {
    setLoading(true);
    try {
      setSectionData(resource, await loadSection(resource));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  const counts = useMemo(() => ({
    products: products.length,
    activeProducts: products.filter((product) => product.isActive).length,
    orders: orders.length,
    newMessages: messages.filter((message) => message.status === 'new').length,
  }), [products, orders, messages]);

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
    setProductForm(EMPTY_PRODUCT);
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
      setProductForm(EMPTY_PRODUCT);
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

  async function importDemoProducts() {
    if (!window.confirm('Add missing demo products to the database? Existing matching products will be skipped.')) {
      return;
    }

    setError('');
    setNotice('');
    try {
      const result = await adminRequest('seed-demo', token, { method: 'POST' });
      setNotice(`Demo catalog imported: ${result.inserted} added, ${result.skipped} already existed.`);
      await refreshSection('products');
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

  if (checking) {
    return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] text-sm text-gray-600">Checking admin session...</main>;
  }

  if (!token) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4 py-10">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl border border-[#e4e9df] bg-white p-8 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#66814a]">Ayurveera Store</p>
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
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#718656]">Ayurveera Store</p>
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
              {item.label}{item.id === 'messages' && counts.newMessages > 0 ? ` (${counts.newMessages})` : ''}
            </button>
          ))}
        </nav>

        {section !== 'products' && error && <p role="alert" aria-live="assertive" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        {section !== 'products' && notice && <p role="status" aria-live="polite" className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">{notice}</p>}
        {loading && <p className="mt-5 text-sm text-gray-500">Loading {section}...</p>}

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
                  <button onClick={importDemoProducts} className="shrink-0 rounded-xl border border-[#163c2b] px-3 py-2 text-sm font-bold text-[#163c2b]">Import demo products</button>
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
                <label className="text-xs font-bold text-gray-600">Category<select required value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} className="mt-1 w-full rounded-lg border bg-white p-2.5 text-sm font-normal">{productCategories.filter((category) => category.name !== 'All Products').map((category) => <option key={category.name} value={category.name}>{category.name}</option>)}</select></label>
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
                <label className="text-xs font-bold text-gray-600">Description<textarea required maxLength={5000} rows="3" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" /></label>
              </fieldset>
              <button disabled={savingProduct} className="mt-4 w-full rounded-xl bg-[#163c2b] py-3 text-sm font-bold text-white disabled:opacity-60">{savingProduct ? 'Saving...' : editingProduct ? 'Save changes' : 'Create product'}</button>
            </form>
          </section>
        )}

        {section === 'orders' && (
          <section className="mt-5 overflow-hidden rounded-2xl border border-[#e2e8de] bg-white">
            <div className="border-b p-4"><h2 className="text-lg font-black">Recent orders</h2><p className="text-sm text-gray-500">Showing up to 200 latest orders.</p></div>
            {orders.length === 0 && !loading && <p className="p-8 text-center text-gray-500">No orders yet.</p>}
            <div className="divide-y">
              {orders.map((order) => (
                <article key={order.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><h3 className="font-black">AYU-{String(order.id).padStart(6, '0')}</h3><span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span></div>
                    <p className="mt-1 font-semibold">{order.customerName} · {order.phone}</p>
                    <p className="text-sm text-gray-600">{order.address}{order.city ? `, ${order.city}` : ''} · {order.pincode}</p>
                    <p className="mt-1 text-sm text-gray-600">Payment: {order.payment === 'RAZORPAY' ? 'Razorpay' : 'Cash on Delivery'} · {order.paymentStatus}</p>
                    <div className="mt-3 flex flex-wrap gap-2">{order.items.map((item, index) => <span key={`${order.id}-${index}`} className="rounded-lg bg-[#f4f6f1] px-2.5 py-1 text-xs">{item.name} × {item.quantity} · ₹{item.price * item.quantity}</span>)}</div>
                  </div>
                  <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end">
                    <p className="text-lg font-black">₹{order.total}</p>
                    <select aria-label={`Order ${order.id} status`} value={order.status} onChange={(event) => updateStatus('orders', order.id, event.target.value)} className="rounded-lg border p-2 text-sm font-semibold">
                      {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
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
                    <p className="mt-1 text-sm text-gray-600">{message.name} · <a className="underline" href={`mailto:${message.email}`}>{message.email}</a></p>
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
