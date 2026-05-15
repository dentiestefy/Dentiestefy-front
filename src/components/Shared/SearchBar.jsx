import { Search } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({ value, onChange, placeholder = 'Buscar...' }) {
    return (
        <div className="search-bar">
            <Search size={16} className="search-bar-icon" />
            <input
                type="text"
                className="search-bar-input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}
