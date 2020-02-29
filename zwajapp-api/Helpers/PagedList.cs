using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace ZwajApp.API.Helpers
{
    public class PagedList<T> : List<T>
    {
        public  int CurrentPage { get; set; }     
        public int TotalPages { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        // Ctor item: تمثل محتوي القائمة , count: عدد العناصر , pageNumber: رقم الصفحة , pageSize حجم الصفحة
        public PagedList(List<T> items , int count , int pageNumber , int pageSize)
        {
            TotalCount=count;
            PageSize=pageSize;
            CurrentPage=pageNumber;
            /*
            اجمالي عدد الصفحات عدد العناصر في الصفحة او المشتركين علي حجم الصفحة مثلا
            27 user / 10  يكون عدد الصفحات صفحتين والباقي سبعة في صفحة 
            */

            TotalPages=(int)Math.Ceiling(count/(double)pageSize);
            this.AddRange(items);
        }
        public static async Task<PagedList<T>> CreateAsync(IQueryable<T> source , int pageNumber , int pageSize )
        {
            // جلب عدد المشتركين 
            var count = await source.CountAsync();
            // حساب اللي جاي
            var items = await source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            // ناتج التنفيذ اللي راجع
            return new PagedList<T>(items , count , pageNumber, pageSize);
        }
    }
}