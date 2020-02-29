using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using System;
using zwajapp_api.Data;

namespace ZwajApp.API.Helpers
{
    public class LogUserActivity : IAsyncActionFilter 
    {
        // نزيد async  لو حدث اي تغيير في وقت تنفيذ ال action
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // استخدام ال next ينتج اكشن معين
            var resultContext = await next();
            // الوصول للمستخدم
            var userId = int.Parse(resultContext.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value);
            // الطلب القادم من الانترفيس وال GetService تضاف يدويا using Microsoft.Extensions.DependencyInjection;
            var repo = resultContext.HttpContext.RequestServices.GetService<IZwajRepostiory>();
            // يمثل المستخدم الحالي 
            var user = await repo.GetUser(userId,true);
            // تعديل اخر ظهور
            user.LastActive = DateTime.Now;
            await repo.SaveAll();

        }
    }
}